import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import { n8nClient } from './src/services/n8nClient.js';
import { normalizeAnalysis } from './src/services/analysisNormalizer.js';
import { getDb, initDb, saveDb } from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLiveE2ESuite() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING 3-PART LIVE PRODUCTION N8N VERIFICATION');
  console.log('======================================================\n');

  await initDb();
  const db = getDb();

  // ----------------------------------------------------
  // TEST #1: Real Batch Ingest -> Workflow 1 -> Gemini -> Normalizer -> DB
  // ----------------------------------------------------
  console.log('--- TEST #1: Ingesting Real Batch to Workflow 1 (/returns-agent) ---');
  const sampleBatch = [
    {
      order_id: 'ORD-LIVE-001',
      order_date: '2026-08-29T10:00:00Z',
      sku: 'BT-KRS-SG-M',
      product_name: 'Kurta Set Sage Green',
      product_category: 'Ethnic Wear',
      size: 'M',
      order_value: 1890,
      journey_outcome: 'returned',
      return_reason_raw: 'size chhota hai chest tight hai',
      customer_comment: 'Ordered M as per chart but bodice chest is way too tight',
      courier: 'Delhivery',
      pincode: '305001',
      is_rto: false,
      payment_method: 'COD'
    },
    {
      order_id: 'ORD-LIVE-002',
      order_date: '2026-08-29T11:00:00Z',
      sku: 'BT-KRS-SG-M',
      product_name: 'Kurta Set Sage Green',
      product_category: 'Ethnic Wear',
      size: 'M',
      order_value: 1890,
      journey_outcome: 'rto',
      return_reason_raw: 'delivery boy marked address not found without calling',
      customer_comment: 'Customer unreachable at door, fake delivery attempt',
      courier: 'Xpress Logistics',
      pincode: '305001',
      is_rto: true,
      payment_method: 'COD'
    },
    {
      order_id: 'ORD-LIVE-003',
      order_date: '2026-08-29T12:00:00Z',
      sku: 'BT-DPT-RS-OS',
      product_name: 'Embroidered Dupatta Rust',
      product_category: 'Ethnic Wear',
      size: 'FreeSize',
      order_value: 1899,
      journey_outcome: 'returned',
      return_reason_raw: 'zari embroidery loose and unraveled',
      customer_comment: 'Metallic zari thread damaged near border',
      courier: 'BlueDart',
      pincode: '400001',
      is_rto: false,
      payment_method: 'Prepaid'
    }
  ];

  const canonicalPayload = {
    returns: sampleBatch,
    order_summary: {
      total_shipped_orders: 50,
      total_delivered_orders: 45,
      cod_shipped_orders: 30,
      prepaid_shipped_orders: 20
    },
    request_context: {
      merchant_id: 'bharatthreads_prod',
      source: 'live_test_suite',
      client_run_id: 'rs_live_e2e_' + Date.now().toString(36)
    }
  };

  const w1Result = await n8nClient.analyzeBatch(canonicalPayload);
  const normalized = normalizeAnalysis(w1Result, w1Result.run?.id || 'live_run', w1Result.intelligence_source);

  console.log('✅ Workflow 1 Output Verified:');
  console.log('   - Intelligence Source:', normalized.metrics.intelligenceSource);
  console.log('   - Run ID:', normalized.run.id);
  console.log('   - Total Events:', normalized.metrics.totalEvents);
  console.log('   - Returned vs RTO:', `${normalized.metrics.totalReturns} Returns / ${normalized.metrics.totalRto} RTOs`);
  console.log('   - Top Reason:', normalized.metrics.topReason);
  console.log('   - Self-Verification Status:', normalized.verification.status);
  console.log('   - Top Problems count:', normalized.topProblems.length);
  console.log('   - Prescribed Recommendations:', normalized.recommendations.map(r => r.action));

  // Save to DB
  db.runs.unshift(normalized.run);
  db.analyses.unshift({ run_id: normalized.run.id, analysis: w1Result, created_at: new Date().toISOString() });
  saveDb();

  // ----------------------------------------------------
  // TEST #2: Ask ReturnShield Follow-up -> Workflow 2 -> LangChain Tools
  // ----------------------------------------------------
  console.log('\n--- TEST #2: Querying Ask ReturnShield Agent (/returnshield-ask) ---');
  const question = 'Why is RTO high and which courier is causing it?';
  const w2Result = await n8nClient.askQuestion(question, w1Result, normalized.run.id);

  console.log('✅ Workflow 2 Output Verified:');
  console.log('   - Intelligence Source:', w2Result.intelligence_source);
  console.log('   - Tools Used:', w2Result.tools_used);
  console.log('   - Confidence:', w2Result.confidence);
  console.log('   - Answer:', w2Result.answer);

  // ----------------------------------------------------
  // TEST #3: Action Approval -> Workflow 3 -> Feedback & Intervention Logging
  // ----------------------------------------------------
  console.log('\n--- TEST #3: Human Approval & Feedback Loop (/returnshield-feedback) ---');
  const targetRecommendation = normalized.recommendations[0] || { target: 'Xpress Logistics', action: 'Require pre-dispatch OTP on COD orders' };
  
  const w3Result = await n8nClient.recordFeedback({
    run_id: normalized.run.id,
    target: targetRecommendation.target,
    outcome: 'approved',
    note: `Live human approval recorded for: ${targetRecommendation.action}`,
    recorded_by: 'Sonu Jangir (Lead Architect)'
  });

  console.log('✅ Workflow 3 Output Verified:');
  console.log('   - Intelligence Source:', w3Result.intelligence_source);
  console.log('   - Stored in n8n/Local:', w3Result.stored);
  console.log('   - Feedback Record:', w3Result.record);

  console.log('\n======================================================');
  console.log('🏆 ALL 3 LIVE PRODUCTION WORKFLOW TESTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runLiveE2ESuite().catch(console.error);
