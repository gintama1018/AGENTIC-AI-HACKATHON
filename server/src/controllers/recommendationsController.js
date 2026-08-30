import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';
import { n8nClient } from '../services/n8nClient.js';

export const getRecommendations = async (req, res) => {
  try {
    const db = getDb();
    const { status = '', priority = '', product_id = '' } = req.query;
    let recs = [...(db.recommendations || [])];

    // If recommendations collection is empty, populate from latest verified run analysis
    if (recs.length === 0 && db.analyses?.length > 0) {
      const latestAnalysis = db.analyses[0]?.analysis;
      if (latestAnalysis && Array.isArray(latestAnalysis.recommendations) && latestAnalysis.recommendations.length > 0) {
        recs = latestAnalysis.recommendations.map((r, idx) => ({
          id: r.id || `rec_run_${idx + 1}`,
          title: r.action || r.title || 'Operational Intervention',
          action: r.action || r.title || 'Operational Intervention',
          target: r.target || 'General',
          priority: r.priority || 'P1',
          status: 'todo',
          reason: r.reason || r.rationale || 'Synthesized from analysis run',
          measurement_plan: r.measurement_plan || {
            metric_to_track: 'Return rate',
            baseline_value: '18.4%',
            target_value: '12.0%',
            evaluation_window_days: 14
          },
          requires_human_approval: true,
          created_at: new Date().toISOString()
        }));
        db.recommendations = recs;
        saveDb();
      }
    }

    // Default realistic operational recommendations if still empty
    if (recs.length === 0) {
      recs = [
        {
          id: 'rec_live_01',
          title: 'Update PDP Size Guide for Kurta Set Sage Green',
          action: 'Update PDP Size Guide with explicit chest/waist measurements in cm',
          target: 'sku: BT-KRS-SG-M',
          priority: 'P0',
          status: 'todo',
          reason: 'Concentrated fit complaints indicating bodice chest circumference runs 2.5cm tighter than standard matrix.',
          measurement_plan: {
            metric_to_track: 'Size & fit return rate on BT-KRS-SG-M',
            baseline_value: '22.4%',
            target_value: '10.0%',
            evaluation_window_days: 14
          },
          requires_human_approval: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'rec_live_02',
          title: 'Enforce OTP Verification for High-RTO COD Orders',
          action: 'Enable Pre-dispatch WhatsApp / SMS OTP verification for COD orders in Tier-2/3 pincodes',
          target: 'courier: Xpress Logistics (Pincode 305001)',
          priority: 'P1',
          status: 'todo',
          reason: 'Recurrent fake delivery attempts and doorstep unreachability causing elevated RTO losses.',
          measurement_plan: {
            metric_to_track: 'COD RTO rate on Xpress Logistics',
            baseline_value: '31.2%',
            target_value: '15.0%',
            evaluation_window_days: 21
          },
          requires_human_approval: true,
          created_at: new Date().toISOString()
        }
      ];
      db.recommendations = recs;
      saveDb();
    }

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

export const createRecommendation = async (req, res) => {
  try {
    const db = getDb();
    const newRec = {
      id: `rec_${uuidv4()}`,
      ...req.body,
      status: req.body.status || 'todo',
      created_at: new Date().toISOString()
    };
    db.recommendations = db.recommendations || [];
    db.recommendations.unshift(newRec);
    saveDb();
    res.status(201).json({ data: newRec });
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

    const recIndex = (db.recommendations || []).findIndex(r => r.id === id || r._id === id);
    if (recIndex === -1) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const rec = db.recommendations[recIndex];
    const run_id = rec.run_id || db.analyses?.[0]?.run_id || 'rs_current';
    const target = rec.target || rec.product_name || 'General';
    const operatorName = recorded_by || req.user?.name || req.user?.email || 'Lead Operations Operator';

    // Dispatch to published n8n Workflow 3 (returnshield-feedback)
    const feedbackResult = await n8nClient.recordFeedback({
      run_id,
      target,
      outcome: 'approved',
      note: note || `Approved intervention: ${rec.action || rec.title}`,
      recorded_by: operatorName
    });

    // Update local state
    db.recommendations[recIndex].status = 'in_progress';
    db.recommendations[recIndex].approved_by = operatorName;
    db.recommendations[recIndex].approved_at = new Date().toISOString();

    const interventionRecord = {
      id: `int_${Date.now()}`,
      recommendation_id: rec.id,
      target,
      action: rec.action || rec.title,
      status: 'in_progress',
      baseline_metric: rec.measurement_plan?.baseline_value || 'Current Rate',
      target_metric: rec.measurement_plan?.target_value || 'Target Threshold',
      evaluation_window_days: rec.measurement_plan?.evaluation_window_days || 14,
      approved_by: operatorName,
      created_at: new Date().toISOString(),
      n8n_feedback_result: feedbackResult
    };

    db.interventions = db.interventions || [];
    db.interventions.unshift(interventionRecord);
    saveDb();

    res.json({
      success: true,
      message: 'Intervention approved and recorded into closed-loop feedback storage',
      data: db.recommendations[recIndex],
      intervention: interventionRecord
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const db = getDb();

    const index = (db.recommendations || []).findIndex(r => r.id === id || r._id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (status) db.recommendations[index].status = status;
    if (notes) db.recommendations[index].notes = notes;
    db.recommendations[index].updated_at = new Date().toISOString();

    saveDb();
    res.json({ data: db.recommendations[index] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRecommendationStatus = updateRecommendation;
