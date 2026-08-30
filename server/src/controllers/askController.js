import { getDb } from '../config/db.js';
import { n8nClient } from '../services/n8nClient.js';

export const askQuestion = async (req, res) => {
  try {
    const { question, run_id } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'Missing "question" string in payload.' });
    }

    const db = getDb();
    let targetAnalysis = null;
    let targetRunId = run_id;

    if (run_id) {
      const match = (db.analyses || []).find(a => a.run_id === run_id);
      targetAnalysis = match?.analysis || null;
    }

    // Default to the latest run analysis if none specified or not found
    if (!targetAnalysis && db.analyses && db.analyses.length > 0) {
      targetAnalysis = db.analyses[0].analysis;
      targetRunId = db.analyses[0].run_id;
    }

    // Dispatch to published Workflow 2 (returnshield-ask)
    const result = await n8nClient.askQuestion(question.trim(), targetAnalysis, targetRunId);

    res.json({
      success: true,
      run_id: targetRunId,
      question: question.trim(),
      answer: result.answer,
      confidence: result.confidence,
      caveats: result.caveats || [],
      tools_used: result.tools_used || [],
      intelligence_source: result.intelligence_source || 'n8n'
    });
  } catch (err) {
    console.error('Error in Ask ReturnShield controller:', err);
    res.status(500).json({ message: err.message });
  }
};
