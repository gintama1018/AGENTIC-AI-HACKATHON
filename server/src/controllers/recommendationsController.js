import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';

export const getRecommendations = async (req, res) => {
  try {
    const db = getDb();
    let recs = [...(db.recommendations || [])];

    const { status, priority, search } = req.query;

    if (status && status !== 'All') {
      recs = recs.filter(r => r.status === status);
    }

    if (priority && priority !== 'All') {
      recs = recs.filter(r => r.priority === priority);
    }

    if (search) {
      const q = search.toLowerCase();
      recs = recs.filter(r => 
        (r.text && r.text.toLowerCase().includes(q)) ||
        (r.product_name && r.product_name.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    // Sort: Critical -> High -> Medium, then todo -> in_progress -> done
    const priorityWeight = { 'Critical': 3, 'High': 2, 'Medium': 1 };
    const statusWeight = { 'todo': 1, 'in_progress': 2, 'done': 3 };

    recs.sort((a, b) => {
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[a.status] - statusWeight[b.status];
      }
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });

    const summary = {
      total: (db.recommendations || []).length,
      todo: (db.recommendations || []).filter(r => r.status === 'todo').length,
      in_progress: (db.recommendations || []).filter(r => r.status === 'in_progress').length,
      done: (db.recommendations || []).filter(r => r.status === 'done').length,
      potentialSavings: (db.recommendations || []).reduce((acc, r) => acc + (r.estimated_savings || 0), 0),
      realizedSavings: (db.recommendations || []).filter(r => r.status === 'done').reduce((acc, r) => acc + (r.estimated_savings || 0), 0)
    };

    res.json({ data: recs, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignee } = req.body;

    const db = getDb();
    const rec = (db.recommendations || []).find(r => r._id === id);

    if (!rec) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (status) rec.status = status;
    if (notes !== undefined) rec.notes = notes;
    if (assignee !== undefined) rec.assignee = assignee;
    rec.updated_at = new Date().toISOString();

    if (status === 'done') {
      rec.resolved_at = new Date().toISOString();
    }

    saveDb();

    res.json({ message: 'Recommendation updated successfully', data: rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRecommendation = async (req, res) => {
  try {
    const { text, priority, category, estimated_savings, product_name } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Recommendation text is required' });
    }

    const db = getDb();
    const newRec = {
      _id: uuidv4(),
      rule_key: `custom_${Date.now()}`,
      product_id: null,
      product_name: product_name || 'Custom Initiative',
      text,
      category: category || 'Operations & Policy',
      priority: priority || 'Medium',
      estimated_savings: parseFloat(estimated_savings || 500),
      status: 'todo',
      created_at: new Date().toISOString()
    };

    db.recommendations.unshift(newRec);
    saveDb();

    res.status(201).json({ message: 'Recommendation created', data: newRec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
