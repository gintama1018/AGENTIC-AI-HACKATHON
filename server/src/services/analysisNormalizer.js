/**
 * Universal Canonical Analysis Normalizer Adapter
 * Maps n8n V3 JSON output (or local deterministic engine) into ONE predictable internal schema.
 */
export const normalizeAnalysis = (rawAnalysis, runIdFallback = 'current', intelligenceSource = 'n8n') => {
  if (!rawAnalysis || typeof rawAnalysis !== 'object') {
    return {
      run: { id: runIdFallback, status: 'uninitialized', analysis_confidence: 'low', verification_passed: false },
      metrics: {
        totalReturns: 0,
        totalRto: 0,
        totalEvents: 0,
        returnRate: null,
        rtoRate: null,
        ratesAvailable: false,
        topReason: 'No analysis data',
        topReasonCount: 0,
        totalFinancialLoss: 0,
        analysisConfidence: 'low',
        avgConfidence: null,
        runId: runIdFallback,
        intelligenceSource,
        verificationPassed: false
      },
      products: [],
      couriers: [],
      geography: [],
      reasons: { returned_categories: {}, rto_categories: {} },
      reasonDistribution: [],
      topProblems: [],
      rootCauses: [],
      hypotheses: [],
      recommendations: [],
      verification: { status: 'pending_run', checks_performed: [], issues_found: [], corrections_applied: [] },
      trends: [],
      dataGaps: ['No analysis run data available.'],
      nextBestQuestions: []
    };
  }

  const run = rawAnalysis.run || {};
  const runId = run.id || rawAnalysis.run_id || runIdFallback;
  const m = rawAnalysis.metrics || {};

  const returnedCount = m.returned_orders ?? m.total_returns ?? 0;
  const rtoCount = m.rto_orders ?? m.total_rto ?? 0;
  const totalEvents = m.total_events ?? (returnedCount + rtoCount);
  const totalValue = m.affected_order_value_inr ?? ((m.return_value_inr || 0) + (m.rto_value_inr || 0));

  // Determine rates availability
  const ratesAvailable = !!(m.rates?.rates_available || (typeof m.rates_available === 'boolean' && m.rates_available));
  const returnRate = ratesAvailable ? (m.return_rate ?? null) : null;
  const rtoRate = ratesAvailable ? (m.rto_rate ?? null) : null;

  // Normalize Reason Distribution
  const returnedCats = rawAnalysis.reason_analysis?.returned_categories || {};
  const rtoCats = rawAnalysis.reason_analysis?.rto_categories || {};
  const combinedReasons = { ...returnedCats, ...rtoCats };

  let reasonDistribution = Object.entries(combinedReasons).map(([name, val]) => {
    const count = typeof val === 'number' ? val : (val?.count || val?.returned_count || 1);
    return {
      name,
      count,
      percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0
    };
  }).sort((a, b) => b.count - a.count);

  if (reasonDistribution.length === 0 && rawAnalysis.top_problems?.length > 0) {
    reasonDistribution = rawAnalysis.top_problems.map(p => ({
      name: p.segment_value || p.problem || 'Identified Cluster',
      count: p.order_count ?? p.count ?? 1,
      percentage: p.share_pct ?? (totalEvents > 0 ? Math.round(((p.order_count ?? p.count ?? 1) / totalEvents) * 100) : 0)
    }));
  }

  // Normalize Top Problems
  const topProblems = (rawAnalysis.top_problems || []).map((p, idx) => {
    const count = p.order_count ?? p.count ?? p.returned_count ?? 1;
    const share = p.share_pct ?? (totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0);
    const priority = p.priority_tier || p.priority || (share >= 30 ? 'P0' : (share >= 15 ? 'P1' : 'P2'));
    return {
      rank: p.rank || (idx + 1),
      priority,
      priority_tier: priority,
      dimension: p.dimension || 'segment',
      segment_value: p.segment_value || p.problem || p.name || 'Segment Hotspot',
      problem: p.problem || `Concentration detected in ${p.segment_value || 'segment'}`,
      order_count: count,
      count,
      share_pct: share,
      uplift: typeof p.uplift === 'number' ? p.uplift : 1.0,
      order_value_lost_inr: p.order_value_lost_inr ?? p.affected_order_value_inr ?? 0,
      affected_order_value_inr: p.order_value_lost_inr ?? p.affected_order_value_inr ?? 0,
      sufficient_evidence: typeof p.sufficient_evidence === 'boolean' ? p.sufficient_evidence : count >= 5,
      likely_cause: p.likely_cause || p.evidence || 'Identified by agent analysis',
      alternative_explanation: p.alternative_explanation || 'Operational variance or listing mismatch',
      hypotheses: p.hypotheses || []
    };
  });

  // Normalize Products / SKUs (Strict Zero Semantic Inventions)
  const rawSkus = rawAnalysis.product_analysis || rawAnalysis.segments?.sku || [];
  const products = rawSkus.map(s => {
    const skuName = s.product_name || s.name || s.sku || s.value || 'UNKNOWN_SKU';
    const skuCode = s.sku || s.product_id || s.value || skuName;
    const count = s.count ?? s.returned_count ?? s.recent_return_count ?? 0;
    const share = s.share_pct ?? (totalEvents > 0 ? Math.round((count / totalEvents) * 100) : null);
    const priority = s.priority || (count >= 5 ? 'High' : 'Low');

    return {
      product_name: skuName,
      sku: skuCode,
      return_rate: typeof s.return_rate === 'number' ? s.return_rate : null,
      week_delta: typeof s.week_delta === 'number' ? s.week_delta : (s.delta ?? null),
      dominant_reason: s.dominant_reason || s.primary_reason || null,
      reason_pct: share,
      recent_return_count: count,
      variant_count: s.variant_count || 1,
      priority,
      sample_comment: s.sample_comment || s.comments?.[0] || null
    };
  });

  // Normalize Couriers
  const rawCouriers = rawAnalysis.courier_analysis || rawAnalysis.segments?.courier || [];
  const couriers = rawCouriers.map(c => ({
    courier: c.courier || c.name || c.value || 'UNKNOWN_COURIER',
    count: c.count ?? c.rto_count ?? 0,
    rtoCount: c.rto_count ?? c.rtoCount ?? 0,
    share_pct: c.share_pct ?? (rtoCount > 0 ? Math.round(((c.rto_count ?? c.rtoCount ?? 0) / rtoCount) * 100) : 0),
    uplift: typeof c.uplift === 'number' ? c.uplift : null
  }));

  // Normalize Recommendations
  const recommendations = (rawAnalysis.recommendations || []).map(r => ({
    id: r.id || `REC-${Math.floor(100 + Math.random() * 900)}`,
    title: r.action || r.title || 'Prescribed Action',
    action: r.action || r.title || 'Prescribed Action',
    target: r.target || 'General',
    reason: r.reason || r.rationale || '',
    rationale: r.reason || r.rationale || '',
    evidence: r.evidence || r.evidence_summary || '',
    evidence_summary: r.evidence || r.evidence_summary || '',
    expected_metric: r.expected_metric || null,
    priority: r.priority || r.priority_tier || 'P1',
    confidence: r.confidence ?? 0.85,
    requires_human_approval: !!r.requires_human_approval,
    approval_reason: r.approval_reason || null,
    measurement_plan: r.measurement_plan || null,
    status: r.status || 'todo'
  }));

  // Normalize Verification
  const verification = rawAnalysis.verification || {
    status: 'passed',
    checks_performed: [],
    issues_found: [],
    corrections_applied: []
  };

  const verificationPassed = String(verification.status || '').toLowerCase().includes('passed');
  const analysisConfidence = rawAnalysis.data_quality?.analysis_confidence || run.analysis_confidence || 'medium';

  return {
    run: {
      id: runId,
      merchant_id: run.merchant_id || rawAnalysis.merchant_id || 'unspecified_merchant',
      generated_at: run.generated_at || run.created_at || new Date().toISOString(),
      status: run.status || 'success',
      analysis_confidence: analysisConfidence,
      records_analyzed: totalEvents,
      verification_passed: verificationPassed
    },
    metrics: {
      totalReturns: returnedCount,
      totalRto: rtoCount,
      totalEvents,
      returnRate,
      rtoRate,
      ratesAvailable,
      topReason: reasonDistribution[0]?.name || topProblems[0]?.segment_value || 'No events analyzed',
      topReasonCount: reasonDistribution[0]?.count || 0,
      totalFinancialLoss: totalValue,
      analysisConfidence,
      avgConfidence: typeof rawAnalysis.metrics?.avg_confidence === 'number' ? rawAnalysis.metrics.avg_confidence : null,
      runId,
      intelligenceSource: rawAnalysis.intelligence_source || intelligenceSource,
      verificationPassed
    },
    products,
    couriers,
    geography: rawAnalysis.geography_analysis || rawAnalysis.segments?.pincode || [],
    reasons: rawAnalysis.reason_analysis || { returned_categories: returnedCats, rto_categories: rtoCats },
    reasonDistribution,
    topProblems,
    rootCauses: rawAnalysis.root_causes || [],
    hypotheses: rawAnalysis.hypotheses || [],
    recommendations,
    verification,
    trends: rawAnalysis.trends || [],
    dataGaps: rawAnalysis.data_gaps || (ratesAvailable ? [] : ['Shipped order summary was not provided. Rate percentages disabled to prevent ungrounded claims.']),
    nextBestQuestions: rawAnalysis.next_best_questions || []
  };
};
