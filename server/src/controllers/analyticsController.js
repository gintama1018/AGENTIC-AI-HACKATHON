import { getDb } from '../config/db.js';
import { normalizeAnalysis } from '../services/analysisNormalizer.js';

export const getOverview = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysisWrapper = db.analyses?.[0] || null;
    const rawAnalysis = latestAnalysisWrapper?.analysis || null;
    const runId = latestAnalysisWrapper?.run_id || 'current';
    const intelligenceSource = db.runs?.[0]?.intelligence_source || 'n8n';

    const normalized = normalizeAnalysis(rawAnalysis, runId, intelligenceSource);
    const returns = db.returns || [];

    res.json({
      metrics: normalized.metrics,
      reasonDistribution: normalized.reasonDistribution,
      topProblems: normalized.topProblems,
      hypotheses: normalized.hypotheses,
      verification: normalized.verification,
      trends: normalized.trends,
      dataGaps: normalized.dataGaps,
      nextBestQuestions: normalized.nextBestQuestions,
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
    const normalized = normalizeAnalysis(latestAnalysis);

    res.json({
      weeklyTrendData: normalized.trends,
      weekly_trends: normalized.trends,
      top_problems: normalized.topProblems,
      hypotheses: normalized.hypotheses,
      trends: normalized.trends
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysis = db.analyses?.[0]?.analysis || null;
    const normalized = normalizeAnalysis(latestAnalysis);

    res.json({ data: normalized.products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFinancialImpact = async (req, res) => {
  try {
    const db = getDb();
    const latestAnalysis = db.analyses?.[0]?.analysis || null;
    const normalized = normalizeAnalysis(latestAnalysis);
    const m = latestAnalysis?.metrics || {};

    res.json({
      totalLoss: normalized.metrics.totalFinancialLoss,
      actualCost: m.actual_cost_inr || null,
      estimatedOperatingCost: m.estimated_cost_inr || null,
      costBasis: m.cost_basis || 'Cost breakdown fields not provided in raw return export',
      ratesAvailable: normalized.metrics.ratesAvailable,
      costDrivers: m.cost_drivers || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
