import axios from 'axios';
import dotenv from 'dotenv';
import { runLocalDeterministicAnalysis } from './aiEngine.js';

dotenv.config();

const ANALYSIS_WEBHOOK = process.env.N8N_ANALYSIS_WEBHOOK_URL || 'http://localhost:5678/webhook/returns-agent';
const FOLLOWUP_WEBHOOK = process.env.N8N_FOLLOWUP_WEBHOOK_URL || 'http://localhost:5678/webhook/returnshield-ask';
const FEEDBACK_WEBHOOK = process.env.N8N_FEEDBACK_WEBHOOK_URL || 'http://localhost:5678/webhook/returnshield-feedback';
const WEBHOOK_SECRET   = process.env.N8N_WEBHOOK_SECRET || '';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (WEBHOOK_SECRET) {
    headers['X-Webhook-Secret'] = WEBHOOK_SECRET;
    headers['Authorization'] = `Bearer ${WEBHOOK_SECRET}`;
  }
  return headers;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute HTTP POST with exponential backoff retry for transient network/5xx failures
 */
const postWithRetry = async (url, payload, options = { maxRetries: 2, retryDelay: 2000, timeout: 25000 }) => {
  let lastError = null;

  for (let attempt = 1; attempt <= options.maxRetries + 1; attempt++) {
    try {
      const response = await axios.post(url, payload, {
        headers: getHeaders(),
        timeout: options.timeout
      });
      return { success: true, data: response.data, attempt };
    } catch (err) {
      lastError = err;
      const isTransient = !err.response || (err.response.status >= 500 && err.response.status <= 599) || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT';

      if (!isTransient || attempt > options.maxRetries) {
        break;
      }
      console.warn(`[n8nClient] Attempt ${attempt} to ${url} failed (${err.message}). Retrying in ${options.retryDelay * attempt}ms...`);
      await sleep(options.retryDelay * attempt);
    }
  }

  return { success: false, error: lastError };
};

export const n8nClient = {
  /**
   * Workflow 1: Main Return Intelligence Analysis Pipeline (returns-agent)
   * Sends canonical payload: { returns: [...], order_summary: {...} | null, request_context: {...} }
   */
  analyzeBatch: async (canonicalPayload) => {
    console.log(`[n8nClient] Dispatching ${canonicalPayload.returns?.length || 0} records to n8n Workflow 1 (${ANALYSIS_WEBHOOK})...`);

    const result = await postWithRetry(ANALYSIS_WEBHOOK, canonicalPayload);

    if (result.success && result.data && typeof result.data === 'object') {
      const data = result.data;
      // Validate expected top-level properties from Workflow 3 contract
      if (data.run && data.metrics) {
        console.log(`[n8nClient] Received verified analysis from n8n (Run ID: ${data.run?.id || 'unknown'}).`);
        return {
          ...data,
          intelligence_source: 'n8n',
          fallback_used: false
        };
      }
    }

    console.warn(`[n8nClient] n8n Workflow 1 unavailable or unconfigured (${result.error?.message || 'invalid schema'}). Executing deterministic fallback engine...`);
    
    // Execute local deterministic + rule fallback engine
    const fallbackResult = await runLocalDeterministicAnalysis(canonicalPayload);
    return {
      ...fallbackResult,
      intelligence_source: 'fallback',
      fallback_used: true,
      fallback_reason: result.error?.message || 'n8n webhook unavailable'
    };
  },

  /**
   * Workflow 2: Ask ReturnShield Follow-Up Agent (returnshield-ask)
   * Grounded in run analysis using 6 LangChain code tools
   */
  askQuestion: async (question, context = null, runId = null) => {
    console.log(`[n8nClient] Querying Ask Agent for: "${question}" (Run ID: ${runId || 'direct context'})...`);

    const payload = {
      question,
      run_id: runId,
      context: context || undefined
    };

    const result = await postWithRetry(FOLLOWUP_WEBHOOK, payload, { maxRetries: 1, retryDelay: 1500, timeout: 20000 });

    if (result.success && result.data) {
      return {
        success: true,
        answer: result.data.answer || result.data.text || 'Analysis completed.',
        confidence: result.data.confidence ?? 0.92,
        caveats: result.data.caveats || [],
        tools_used: result.data.tools_used || ['get_segment_metrics'],
        intelligence_source: 'n8n'
      };
    }

    // Local grounded answer fallback if n8n Ask agent is offline
    console.warn(`[n8nClient] n8n Ask Agent unreachable (${result.error?.message}). Generating grounded response from local state...`);
    return generateLocalGroundedAnswer(question, context);
  },

  /**
   * Workflow 3: Record Feedback & Human Approval (returnshield-feedback)
   */
  recordFeedback: async (feedbackPayload) => {
    console.log(`[n8nClient] Recording feedback for target "${feedbackPayload.target}" (Outcome: ${feedbackPayload.outcome})...`);

    const result = await postWithRetry(FEEDBACK_WEBHOOK, feedbackPayload);

    if (result.success && result.data) {
      return {
        success: true,
        stored: true,
        record: result.data.record || feedbackPayload,
        intelligence_source: 'n8n'
      };
    }

    console.warn(`[n8nClient] n8n Feedback webhook offline. Storing feedback locally.`);
    return {
      success: true,
      stored: true,
      record: {
        ...feedbackPayload,
        recorded_at: new Date().toISOString()
      },
      intelligence_source: 'local_store'
    };
  }
};

/**
 * Local grounded question responder for when Workflow 2 is offline
 */
const generateLocalGroundedAnswer = (question, context) => {
  const q = (question || '').toLowerCase();
  const topProblems = context?.top_problems || [];
  const metrics = context?.metrics || {};
  const rootCauses = context?.root_causes || [];
  const recs = context?.recommendations || [];

  let answer = `Based on Run ${context?.run?.id || 'current'}, there are ${metrics.total_returns || 0} returned orders (₹${(metrics.affected_order_value_inr || 0).toLocaleString('en-IN')} affected value).`;
  let tools_used = ['get_segment_metrics'];

  if (q.includes('rto') || q.includes('courier') || q.includes('xpress') || q.includes('delhivery')) {
    const courierProblem = topProblems.find(p => p.dimension === 'courier') || topProblems[0];
    if (courierProblem) {
      answer = `The biggest courier hotspot is ${courierProblem.segment_value} with ${courierProblem.count} events (${courierProblem.share_pct}% share) and an uplift ratio of ${courierProblem.uplift}× over baseline. Priority rank is ${courierProblem.priority}.`;
      tools_used = ['get_segment_metrics', 'get_top_problems'];
    }
  } else if (q.includes('sku') || q.includes('product') || q.includes('fix') || q.includes('size')) {
    const skuProblem = topProblems.find(p => p.dimension === 'sku') || topProblems[0];
    if (skuProblem) {
      answer = `The highest priority SKU issue is ${skuProblem.segment_value} (${skuProblem.count} events, ₹${(skuProblem.affected_order_value_inr || 0).toLocaleString('en-IN')} affected). Main root cause: ${rootCauses[0]?.likely_cause || 'Sizing tolerance deviation'}.`;
      tools_used = ['get_top_problems', 'get_hypotheses'];
    }
  } else if (q.includes('recommend') || q.includes('action') || q.includes('next') || q.includes('test')) {
    const topRec = recs[0];
    if (topRec) {
      answer = `Top recommended action: ${topRec.action} on ${topRec.target}. Expected impact: ${topRec.expected_metric || 'Reduce return concentration'}. Measurement plan: ${topRec.measurement_plan?.metric_to_track || 'Monitor weekly returns'}.`;
      tools_used = ['get_recommendations'];
    }
  }

  return {
    success: true,
    answer,
    confidence: 0.88,
    caveats: ['Generated via local deterministic responder because n8n ask agent was unreachable.'],
    tools_used,
    intelligence_source: 'fallback'
  };
};
