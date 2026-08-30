import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';
import { n8nClient } from '../services/n8nClient.js';

export const getRecommendations = async (req, res) => {
  try {
    const db = getDb();
    const { status = '', priority = '', product_id = '' } = req.query;
    let recs = [...(db.recommendations || [])];

    if (status && status !== 'All') {
      recs = recs.filter(r => r.status === status);
    }

    if (priority && priority !== 'All') {
      recs = recs.filter(r => r.priority === priority);
    }

    if (product_id && product_id !== 'All') {
      recs = recs.filter(r => r.product_id === product_id || r.target?.includes(product_id));
    }

    res.json({
      data: recs,
      total: recs.length,
      interventions: db.interventions || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Human Approval & Intervention Recording Flow:
 * Approves a recommendation -> Dispatches to published n8n Workflow 3 -> Logs intervention state
 */
export const approveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { note = '', recorded_by = '' } = req.body;
    const db = getDb();

    const rec = (db.recommendations || []).find(r => r.id === id || r._id === id);
    if (!rec) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const run_id = rec.run_id || db.analyses?.[0]?.run_id || 'rs_current';
    const target = rec.target || rec.product_name || 'General';
    const operatorName = recorded_by || req.user?.name || req.user?.email || 'Operator';

    // Dispatch to published n8n Workflow 3 (returnshield-feedback)
    const feedbackResult = await n8nClient.recordFeedback({
      run_id,
      target,
      outcome: 'approved',
      note: note || `Approved intervention: ${rec.action || rec.title}`,
      recorded_by: operatorName
    });

    // Update recommendation status to in_progress
    rec.status = 'in_progress';
    rec.approved_at = new Date().toISOString();
    rec.approved_by = operatorName;

    // Create persistent intervention tracking record
    const intervention = {
      id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
      rec_id: rec.id,
      run_id,
      target,
      action: rec.action || rec.title,
      status: 'active',
      baseline_metric: rec.measurement_plan?.baseline_value || 'Pending baseline evaluation',
      target_metric: rec.measurement_plan?.target_value || 'Target evaluation window',
      evaluation_window_days: rec.measurement_plan?.evaluation_window_days || 14,
      note,
      approved_by: operatorName,
      created_at: new Date().toISOString()
    };

    db.interventions = [intervention, ...(db.interventions || [])];
    saveDb();

    res.json({
      message: 'Recommendation approved and intervention recorded in feedback engine.',
      recommendation: rec,
      intervention,
      feedbackResult
    });
  } catch (err) {
    console.error('Error approving recommendation:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes = '', measured_outcome = null } = req.body;

    const VALID_STATUSES = ['todo', 'in_progress', 'implemented', 'measurement_pending', 'validated', 'ineffective', 'rejected'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const db = getDb();
    const recIndex = (db.recommendations || []).findIndex(r => r.id === id || r._id === id);

    if (recIndex === -1) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const rec = db.recommendations[recIndex];
    rec.status = status;
    rec.notes = notes;
    rec.updated_at = new Date().toISOString();

    // Honest outcome recording: only record measured outcome if provided by real test
    if (measured_outcome) {
      rec.measured_outcome = measured_outcome;
    }

    // Log status transition in Workflow 3
    n8nClient.recordFeedback({
      run_id: rec.run_id || 'rs_current',
      target: rec.target || 'General',
      outcome: status === 'validated' ? 'resolved' : (status === 'implemented' ? 'implemented' : 'accepted'),
      note: notes || `Status transitioned to ${status}`,
      recorded_by: req.user?.name || req.user?.email || 'Operator'
    }).catch(console.warn);

    saveDb();

    res.json({
      message: `Recommendation status updated to ${status}`,
      data: db.recommendations[recIndex]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRecommendation = async (req, res) => {
  try {
    const { title, text, product_id, category, priority, estimated_savings, target, measurement_plan } = req.body;
    const db = getDb();

    const newRec = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      run_id: db.analyses?.[0]?.run_id || 'rs_current',
      title: title || text,
      action: title || text,
      target: target || 'Storewide',
      reason: text,
      category: category || 'General',
      priority: priority || 'P1',
      estimated_savings: estimated_savings || null,
      status: 'todo',
      requires_human_approval: false,
      measurement_plan: measurement_plan || null,
      created_at: new Date().toISOString()
    };

    db.recommendations = [newRec, ...(db.recommendations || [])];
    saveDb();

    res.status(201).json({
      message: 'Recommendation created successfully',
      data: newRec
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
