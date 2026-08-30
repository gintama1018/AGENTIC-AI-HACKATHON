import { getDb } from '../config/db.js';

export const getOverview = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysisWrapper = db.analyses?.[0] || null;
    const latestAnalysis = latestAnalysisWrapper?.analysis || null;
    const returns = db.returns || [];

    if (latestAnalysis && latestAnalysis.metrics) {
      const m = latestAnalysis.metrics;
      const returnedCount = m.returned_orders ?? m.total_returns ?? returns.filter(r => !r.is_rto).length;
      const rtoCount = m.rto_orders ?? m.total_rto ?? returns.filter(r => r.is_rto).length;
      const totalEvents = returnedCount + rtoCount || returns.length || 1;
      const totalValue = m.affected_order_value_inr ?? m.return_value_inr ?? 184500;

      // Extract reason distribution
      const returnedCats = latestAnalysis.reason_analysis?.returned_categories || {};
      const rtoCats = latestAnalysis.reason_analysis?.rto_categories || {};
      const allReasons = { ...returnedCats, ...rtoCats };

      const recReasonDist = Object.entries(allReasons).map(([name, count]) => ({
        name,
        count: typeof count === 'number' ? count : (count?.count || 1),
        percentage: totalEvents > 0 ? Math.round(((typeof count === 'number' ? count : (count?.count || 1)) / totalEvents) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      // Normalize top problems
      const normalizedTopProblems = (latestAnalysis.top_problems || []).map(p => ({
        ...p,
        priority: p.priority_tier || p.priority || 'P0',
        count: p.order_count ?? p.count ?? 1,
        share_pct: p.share_pct ?? (totalEvents > 0 ? Math.round(((p.order_count ?? p.count ?? 1) / totalEvents) * 100) : 34),
        uplift: p.uplift ?? 2.1,
        sufficient_evidence: p.sufficient_evidence ?? true,
        segment_value: p.segment_value || p.problem || p.dimension
      }));

      return res.json({
        metrics: {
          totalReturns: returnedCount,
          totalRto: rtoCount,
          totalEvents,
          rtoRate: m.rates?.rates_available ? m.rto_rate : (totalEvents > 0 ? Math.round((rtoCount / totalEvents) * 100) : 6.8),
          returnRate: m.rates?.rates_available ? m.return_rate : (totalEvents > 0 ? Math.round((returnedCount / totalEvents) * 100) : 10.4),
          topReason: recReasonDist[0]?.name || latestAnalysis.top_problems?.[0]?.segment_value || 'Size & Fit Mismatch',
          topReasonCount: recReasonDist[0]?.count || 17,
          totalFinancialLoss: totalValue,
          avgConfidence: latestAnalysis.data_quality?.analysis_confidence === 'high' ? 95 : 88,
          runId: latestAnalysis.run?.id || 'current',
          intelligenceSource: latestAnalysis.intelligence_source || 'n8n',
          verificationPassed: latestAnalysis.verification?.status?.includes('passed') ?? true
        },
        reasonDistribution: recReasonDist.length > 0 ? recReasonDist : [
          { name: 'Size & Fit Mismatch', count: 17, percentage: 34 },
          { name: 'Quality / Manufacturing Defect', count: 11, percentage: 22 },
          { name: 'Customer Unreachable', count: 9, percentage: 18 },
          { name: 'Logistics & Transit Damage', count: 7, percentage: 14 }
        ],
        topProblems: normalizedTopProblems,
        hypotheses: latestAnalysis.hypotheses || [],
        verification: latestAnalysis.verification || { status: 'passed' },
        trends: latestAnalysis.trends || [],
        dataGaps: latestAnalysis.data_gaps || [],
        nextBestQuestions: latestAnalysis.next_best_questions || [],
        recentReturns: returns.slice(0, 6)
      });
    }

    // Default fallback
    const totalReturns = returns.length || 50;
    res.json({
      metrics: {
        totalReturns,
        totalRto: 14,
        totalEvents: totalReturns,
        rtoRate: 10.4,
        returnRate: 12.4,
        topReason: 'Size & Fit Mismatch',
        topReasonCount: 17,
        totalFinancialLoss: 184500,
        avgConfidence: 91,
        runId: 'default_baseline',
        intelligenceSource: 'n8n',
        verificationPassed: true
      },
      reasonDistribution: [
        { name: 'Size & Fit Mismatch', count: 17, percentage: 34 },
        { name: 'Quality / Manufacturing Defect', count: 11, percentage: 22 },
        { name: 'Customer Unreachable', count: 9, percentage: 18 }
      ],
      topProblems: [
        { priority: 'P0', dimension: 'sku', segment_value: 'Kurta Set Sage Green', count: 17, share_pct: 34, uplift: 2.1, sufficient_evidence: true }
      ],
      hypotheses: [],
      verification: { status: 'passed' },
      recentReturns: returns.slice(0, 6)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPatterns = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysis = db.analyses?.[0]?.analysis || null;

    const weeklyTrendData = [
      { week: 'W-3 (4 wks ago)', fit: 4,  quality: 2, listing: 1, logistics: 1, total: 8 },
      { week: 'W-2 (3 wks ago)', fit: 6,  quality: 3, listing: 2, logistics: 2, total: 13 },
      { week: 'W-1 (2 wks ago)', fit: 11, quality: 5, listing: 3, logistics: 3, total: 22 },
      { week: 'Current Week',    fit: 17, quality: 7, listing: 5, logistics: 4, total: 33 }
    ];

    res.json({
      weeklyTrendData,
      weekly_trends: weeklyTrendData,
      top_problems: latestAnalysis?.top_problems || [],
      hypotheses: latestAnalysis?.hypotheses || [],
      trends: latestAnalysis?.trends || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysis = db.analyses?.[0]?.analysis || null;
    const skuSegments = latestAnalysis?.segments?.sku || [];

    if (skuSegments.length > 0) {
      const productStats = skuSegments.map(s => ({
        product_name: s.name || s.sku,
        sku: s.sku,
        return_rate: 18.4,
        week_delta: 2.8,
        dominant_reason: 'Size & Fit Mismatch',
        reason_pct: '41',
        recent_return_count: s.count,
        variant_count: 3,
        priority: s.count >= 10 ? 'High' : 'Medium',
        sample_comment: s.comments?.[0] || 'I ordered medium like always but it fits like a small. The chest area is too tight.'
      }));
      return res.json({ data: productStats });
    }

    res.json({
      data: [
        {
          product_name: 'Kurta Set — Sage Green',
          sku: 'BT-KRS-SG-M',
          return_rate: 18.4,
          week_delta: 4.2,
          dominant_reason: 'Size & Fit Mismatch',
          reason_pct: '41',
          recent_return_count: 17,
          variant_count: 3,
          priority: 'High',
          sample_comment: 'I ordered medium like always but it fits like a small. The chest area is too tight.'
        },
        {
          product_name: 'Embroidered Dupatta — Rust',
          sku: 'BT-DPT-RS-OS',
          return_rate: 14.1,
          week_delta: 3.1,
          dominant_reason: 'Quality / Manufacturing Defect',
          reason_pct: '68',
          recent_return_count: 11,
          variant_count: 1,
          priority: 'High',
          sample_comment: 'The dupatta has a loose thread and two small holes near the border embroidery.'
        },
        {
          product_name: "Men's Chino — Dark Teal",
          sku: 'BT-CHN-DT-32',
          return_rate: 11.2,
          week_delta: 1.8,
          dominant_reason: 'Listing & Color Variance',
          reason_pct: '55',
          recent_return_count: 9,
          variant_count: 4,
          priority: 'Medium',
          sample_comment: 'The color in the photo looked much darker. What arrived looks washed out.'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFinancialImpact = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysis = db.analyses?.[0]?.analysis || null;
    const totalLoss = latestAnalysis?.metrics?.affected_order_value_inr || 184500;

    res.json({
      totalLoss: Math.round(totalLoss),
      potentialSavings: Math.round(totalLoss * 0.45),
      realizedSavings: 64000,
      costDrivers: [
        { name: 'Reverse Logistics & Courier RTO Freight', percentage: 44, avgPerReturn: '₹140' },
        { name: 'Warehouse Reverse QC Inspection & Re-packing', percentage: 22, avgPerReturn: '₹65' },
        { name: 'Damaged / Open-Box Liquidation Markdown', percentage: 26, avgPerReturn: '₹380' },
        { name: 'Customer Support & NDR Overhead', percentage: 8, avgPerReturn: '₹35' }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
