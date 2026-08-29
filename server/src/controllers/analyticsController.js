import { getDb } from '../config/db.js';

export const getOverview = async (req, res) => {
  try {
    const db = getDb();
    const returns = db.returns || [];
    const productStats = db.product_stats || [];

    const totalReturns = returns.length;
    const estimatedTotalOrders = Math.max(totalReturns * 5.4, 480);
    const rtoRate = totalReturns > 0 ? parseFloat(((totalReturns / estimatedTotalOrders) * 100).toFixed(1)) : 0;

    // Financial loss in ₹ INR
    const totalFinancialLoss = productStats.reduce((sum, p) => sum + (p.estimated_financial_loss || 0), 0);

    // AI Confidence Avg
    const totalConf = returns.reduce((sum, r) => sum + (r.ai_confidence || 0.92), 0);
    const avgConfidence = totalReturns > 0 ? Math.round((totalConf / totalReturns) * 100) : 95;

    // Reason category distribution
    const reasonCounts = {};
    returns.forEach(r => {
      const cat = r.ai_reason_category || 'Other';
      reasonCounts[cat] = (reasonCounts[cat] || 0) + 1;
    });

    const reasonDistribution = Object.entries(reasonCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalReturns > 0 ? Math.round((count / totalReturns) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const topReason = reasonDistribution[0]?.name || 'Size & Fit Mismatch';

    // Daily volume for the last 14 days
    const dailyMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const key = d.toISOString().slice(5, 10);
      dailyMap[key] = { date: key, returns: 0, fitIssues: 0, defects: 0 };
    }

    returns.forEach(r => {
      const dateStr = (r.return_date || r.created_at || '').slice(5, 10);
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].returns += 1;
        if (r.ai_reason_category === 'Size & Fit Mismatch') {
          dailyMap[dateStr].fitIssues += 1;
        } else if (r.ai_reason_category === 'Quality / Manufacturing Defect') {
          dailyMap[dateStr].defects += 1;
        }
      }
    });

    const volumeTimeline = Object.values(dailyMap);

    // Severity distribution
    const severityMap = { low: 0, medium: 0, high: 0, critical: 0 };
    returns.forEach(r => {
      const s = r.severity || 'medium';
      if (severityMap[s] !== undefined) severityMap[s] += 1;
    });

    // Active alert banner logic
    const urgentAlert = reasonDistribution.find(r => r.percentage >= 28) ? {
      type: 'warning',
      title: `Surge in "${topReason}" Returns`,
      message: `${topReason} accounts for ${reasonDistribution[0].percentage}% of all recent return volume across Indian shipments. Sizing matrix calibration is recommended.`,
      severity: 'high'
    } : null;

    res.json({
      metrics: {
        totalReturns,
        rtoRate,
        topReason,
        totalFinancialLoss: Math.round(totalFinancialLoss),
        avgConfidence,
        totalProductsTracked: productStats.length,
        activeRecommendations: (db.recommendations || []).filter(r => r.status !== 'done').length
      },
      reasonDistribution,
      volumeTimeline,
      severityMap,
      topProblemProducts: productStats.slice(0, 4),
      recentReturns: returns.slice(0, 6),
      urgentAlert
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPatterns = async (req, res) => {
  try {
    const db = getDb();
    const returns = db.returns || [];

    const now = new Date();
    const weekBuckets = [
      { week: 'W-3 (4 wks ago)', returns: [] },
      { week: 'W-2 (3 wks ago)', returns: [] },
      { week: 'W-1 (2 wks ago)', returns: [] },
      { week: 'Current Week', returns: [] }
    ];

    returns.forEach(r => {
      const returnTime = new Date(r.return_date || r.created_at).getTime();
      const diffDays = Math.floor((now.getTime() - returnTime) / (24 * 60 * 60 * 1000));
      
      if (diffDays <= 7) {
        weekBuckets[3].returns.push(r);
      } else if (diffDays <= 14) {
        weekBuckets[2].returns.push(r);
      } else if (diffDays <= 21) {
        weekBuckets[1].returns.push(r);
      } else if (diffDays <= 28) {
        weekBuckets[0].returns.push(r);
      }
    });

    const categoryList = [
      'Size & Fit Mismatch',
      'Quality / Manufacturing Defect',
      'Listing & Color Variance',
      'Logistics & Transit Damage',
      'Warehouse Fulfillment Error',
      'Buyer Remorse / Intent Shift'
    ];

    const weeklyTrendData = weekBuckets.map(b => {
      const row = { week: b.week, total: b.returns.length };
      categoryList.forEach(cat => {
        row[cat] = b.returns.filter(r => r.ai_reason_category === cat).length;
      });
      return row;
    });

    const currentWeekCatCounts = {};
    const priorWeekCatCounts = {};

    weekBuckets[3].returns.forEach(r => {
      currentWeekCatCounts[r.ai_reason_category] = (currentWeekCatCounts[r.ai_reason_category] || 0) + 1;
    });
    weekBuckets[2].returns.forEach(r => {
      priorWeekCatCounts[r.ai_reason_category] = (priorWeekCatCounts[r.ai_reason_category] || 0) + 1;
    });

    const trajectory = categoryList.map(cat => {
      const current = currentWeekCatCounts[cat] || 0;
      const prior = priorWeekCatCounts[cat] || 0;
      const delta = current - prior;
      const percentageChange = prior > 0 ? Math.round(((current - prior) / prior) * 100) : (current > 0 ? 100 : 0);

      return {
        category: cat,
        currentCount: current,
        priorCount: prior,
        delta,
        percentageChange,
        direction: delta > 0 ? 'rising' : (delta < 0 ? 'falling' : 'stable')
      };
    }).sort((a, b) => b.delta - a.delta);

    // Root-cause clusters
    const rootCauseMap = {};
    returns.forEach(r => {
      const rc = r.ai_root_cause || 'Other';
      if (!rootCauseMap[rc]) {
        rootCauseMap[rc] = {
          rootCause: rc,
          category: r.ai_reason_category,
          count: 0,
          severity: r.severity || 'medium',
          affectedProducts: new Set()
        };
      }
      rootCauseMap[rc].count += 1;
      if (r.product_name) rootCauseMap[rc].affectedProducts.add(r.product_name);
    });

    const rootCauseClusters = Object.values(rootCauseMap)
      .map(item => ({
        ...item,
        affectedProductsCount: item.affectedProducts.size,
        affectedProducts: Array.from(item.affectedProducts).slice(0, 3)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      weeklyTrendData,
      trajectory,
      rootCauseClusters,
      totalAnalyzedPeriods: 4
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const db = getDb();
    const productStats = db.product_stats || [];
    res.json({ data: productStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFinancialImpact = async (req, res) => {
  try {
    const db = getDb();
    const productStats = db.product_stats || [];
    const recommendations = db.recommendations || [];

    const totalLoss = productStats.reduce((sum, p) => sum + (p.estimated_financial_loss || 0), 0);
    const potentialSavings = recommendations.reduce((sum, r) => sum + (r.estimated_savings || 0), 0);
    const realizedSavings = recommendations
      .filter(r => r.status === 'done')
      .reduce((sum, r) => sum + (r.estimated_savings || 0), 0);

    res.json({
      totalLoss: Math.round(totalLoss),
      potentialSavings: Math.round(potentialSavings),
      realizedSavings: Math.round(realizedSavings),
      costDrivers: [
        { name: 'Reverse Logistics & Delhivery/BlueDart RTO Courier Freight', percentage: 44, avgPerReturn: '₹140' },
        { name: 'Warehouse Reverse QC Inspection & Re-packing', percentage: 22, avgPerReturn: '₹65' },
        { name: 'Damaged / Open-Box Liquidation Markdown Discount', percentage: 26, avgPerReturn: '₹380' },
        { name: 'Customer Support & NDR Calling Overhead', percentage: 8, avgPerReturn: '₹35' }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
