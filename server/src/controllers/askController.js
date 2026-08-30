import { getDb } from '../config/db.js';
import { n8nClient } from '../services/n8nClient.js';
import { runLocalDeterministicAnalysis } from '../services/aiEngine.js';

export const askQuestion = async (req, res) => {
  try {
    const { question, run_id } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'Missing "question" string in payload.' });
    }

    const db = getDb();
    let targetAnalysis = null;
    let targetRunId = run_id;

    if (run_id && run_id !== 'current') {
      const match = (db.analyses || []).find(a => a.run_id === run_id);
      targetAnalysis = match?.analysis || null;
    }

    // Default to the latest run analysis
    if (!targetAnalysis && db.analyses && db.analyses.length > 0) {
      targetAnalysis = db.analyses[0].analysis;
      targetRunId = db.analyses[0].run_id;
    }

    // If still no analysis wrapper, generate dynamically strictly from actual stored returns
    if (!targetAnalysis) {
      const returns = db.returns || [];
      if (returns.length === 0) {
        return res.json({
          success: true,
          run_id: 'uninitialized',
          question: question.trim(),
          answer: 'No return records are currently loaded in the system. Please import a return batch first to explore intelligence.',
          confidence: 0.5,
          caveats: ['No dataset loaded.'],
          tools_used: [],
          intelligence_source: 'fallback'
        });
      }

      const dynamicPayload = {
        returns: returns.map(r => ({
          order_id: r.order_id || r.id,
          sku: r.sku || 'UNKNOWN_SKU',
          product_name: r.product_name || null,
          product_category: r.category || 'UNKNOWN_CATEGORY',
          order_value: Number(r.order_value) || null,
          journey_outcome: r.is_rto ? 'rto' : 'returned',
          return_reason_raw: r.detected_reason || r.return_reason_raw || '',
          customer_comment: r.customer_comment || '',
          courier: r.logistics_partner || 'UNKNOWN_COURIER',
          pincode: r.customer_city ? r.customer_city.replace('PIN ', '') : 'UNKNOWN_PINCODE',
          is_rto: !!r.is_rto
        })),
        order_summary: null,
        request_context: {
          merchant_id: req.user?.company_name || 'unspecified_merchant',
          source: 'dynamic_ask',
          client_run_id: 'rs_live_current'
        }
      };
      targetAnalysis = await runLocalDeterministicAnalysis(dynamicPayload);
      targetRunId = 'rs_live_current';
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
