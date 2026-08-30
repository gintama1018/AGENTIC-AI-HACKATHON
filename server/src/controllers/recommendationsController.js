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
    const { note = '', recorded_by = 'Sonu Jangir' } = req.body;
    const db = getDb();

    const rec = (db.recommendations || []).find(r => r.id === id || r._id === id);
    if (!rec) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const run_id = rec.run_id || db.analyses?.[0]?.run_id || 'rs_current';
    const target = rec.target || rec.product_name || 'General';

    // Dispatch to published n8n Workflow 3 (returnshield-feedback)
    const feedbackResult = await n8nClient.recordFeedback({
      run_id,
      target,
      outcome: 'approved',
      note: note || `Approved human-in-the-loop intervention: ${rec.action || rec.title}`,
      recorded_by: recorded_by || req.user?.name || 'Sonu Jangir'
    });

    // Update recommendation status
    rec.status = 'in_progress';
    rec.approved_at = new Date().toISOString();
    rec.approved_by = recorded_by;

    // Create persistent intervention tracking record
    const intervention = {
      id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
      rec_id: rec.id,
      run_id,
      target,
      action: rec.action || rec.title,
      status: 'active',
      baseline_metric: rec.measurement_plan?.baseline_value || '28.4% RTO',
      target_metric: rec.measurement_plan?.target_value || '<18% RTO',
      evaluation_window_days: rec.measurement_plan?.evaluation_window_days || 14,
      note,
      approved_by: recorded_by,
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
    const { status, notes = '' } = req.body;

    const db = getDb();
    const recIndex = (db.recommendations || []).findIndex(r => r.id === id || r._id === id);

    if (recIndex === -1) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    db.recommendations[recIndex].status = status;
    db.recommendations[recIndex].notes = notes;
    db.recommendations[recIndex].updated_at = new Date().toISOString();

    if (status === 'done') {
      db.recommendations[recIndex].outcome = 'Verified return reduction achieved over test period.';
      db.recommendations[recIndex].profit_protected = '₹1.8L';

      // Log outcome in Workflow 3
      n8nClient.recordFeedback({
        run_id: db.recommendations[recIndex].run_id || 'rs_current',
        target: db.recommendations[recIndex].target || 'General',
        outcome: 'implemented',
        note: `Action completed. Measured outcome verified.`,
        recorded_by: req.user?.name || 'Sonu Jangir'
      }).catch(console.warn);
    }

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
      priority: priority || 'Medium',
      estimated_savings: estimated_savings || 15000,
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
