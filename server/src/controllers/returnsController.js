import fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';
import { n8nClient } from '../services/n8nClient.js';
import { classifyCustomerReturn } from '../services/aiEngine.js';
import { getInitialSeedData } from '../data/seedData.js';

const toStr = (v, fallback = null) => {
  if (v === undefined || v === null || String(v).trim() === '') return fallback;
  return String(v).trim();
};

const toNum = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/[,₹\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'rto'].includes(s);
};

const normalizePayment = (v) => {
  if (!v) return 'Unknown';
  const s = String(v).trim().toLowerCase();
  if (s.includes('cod') || s.includes('cash')) return 'COD';
  if (s.includes('prepaid') || s.includes('online') || s.includes('card') || s.includes('upi')) return 'Prepaid';
  return 'Unknown';
};

const deriveOutcome = (row, isRto) => {
  const explicit = toStr(row.journey_outcome || row.outcome, '').toLowerCase();
  if (['delivered', 'returned', 'rto', 'cancelled', 'unknown'].includes(explicit)) return explicit;

  const status = toStr(row.order_status || row.status, '').toLowerCase();
  if (isRto || status.includes('rto') || status.includes('return to origin') || status.includes('undelivered')) return 'rto';
  if (status.includes('cancel')) return 'cancelled';
  if (status.includes('return')) return 'returned';
  if (status.includes('deliver')) return 'delivered';
  return 'unknown';
};

export const getReturns = async (req, res) => {
  try {
    const db = getDb();
    let returns = [...(db.returns || [])];

    const {
      search = '',
      category = '',
      status = '',
      product_id = '',
      severity = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 25,
      sortBy = 'return_date',
      sortOrder = 'desc'
    } = req.query;

    // Filters
    if (search) {
      const q = search.toLowerCase();
      returns = returns.filter(r => 
        (r.order_id && r.order_id.toLowerCase().includes(q)) ||
        (r.product_name && r.product_name.toLowerCase().includes(q)) ||
        (r.customer_comment && r.customer_comment.toLowerCase().includes(q)) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
        (r.ai_root_cause && r.ai_root_cause.toLowerCase().includes(q)) ||
        (r.ai_reason_category && r.ai_reason_category.toLowerCase().includes(q)) ||
        (r.detected_reason && r.detected_reason.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      returns = returns.filter(r => r.ai_reason_category === category || r.category === category || r.detected_reason === category);
    }

    if (status && status !== 'All') {
      returns = returns.filter(r => r.status === status);
    }

    if (product_id && product_id !== 'All') {
      returns = returns.filter(r => r.product_id === product_id || r.sku === product_id);
    }

    if (severity && severity !== 'All') {
      returns = returns.filter(r => r.severity === severity);
    }

    if (startDate) {
      const s = new Date(startDate).getTime();
      returns = returns.filter(r => new Date(r.return_date || r.created_at).getTime() >= s);
    }

    if (endDate) {
      const e = new Date(endDate).getTime();
      returns = returns.filter(r => new Date(r.return_date || r.created_at).getTime() <= e);
    }

    // Sorting
    returns.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';

      if (sortBy === 'return_date' || sortBy === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    const total = returns.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = returns.slice(startIndex, startIndex + limitNum);

    res.json({
      data: paginated,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const returnItem = (db.returns || []).find(r => r._id === id || r.order_id === id || r.id === id);

    if (!returnItem) {
      return res.status(404).json({ message: 'Return record not found' });
    }

    const matchingRec = (db.recommendations || []).find(rec => rec.product_id === returnItem.sku || rec.target?.includes(returnItem.product_name));

    res.json({
      data: returnItem,
      recommendation: matchingRec || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Production Ingestion Flow:
 * CSV Upload -> Normalize (5,000 row guard) -> Canonical Payload -> n8n Workflow 1 -> Validate & Persist
 */
export const importReturns = async (req, res) => {
  try {
    const db = getDb();
    let rawItems = [];

    // If file was uploaded
    if (req.file) {
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      // Cleanup temp uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}

      rawItems = results;
    } else if (req.body && Array.isArray(req.body.returns)) {
      rawItems = req.body.returns;
    } else if (Array.isArray(req.body)) {
      rawItems = req.body;
    } else {
      return res.status(400).json({ message: 'No file or returns array provided' });
    }

    if (rawItems.length === 0) {
      return res.status(400).json({ message: 'No valid return records found in payload' });
    }

    // Enforce 5,000-row ingestion safety guard
    const cappedItems = rawItems.length > 5000 ? rawItems.slice(0, 5000) : rawItems;
    if (rawItems.length > 5000) {
      console.warn(`[importReturns] Truncated payload from ${rawItems.length} to 5000 records per ingestion guard.`);
    }

    // Build Canonical n8n Payload with strict honest value mapping
    const normalizedReturns = cappedItems.map((row, idx) => {
      const is_rto = toBool(row.is_rto || row.rto || row.isRTO);
      const journey_outcome = deriveOutcome(row, is_rto);
      const order_value = toNum(row.order_value || row.product_price || row.price || row['Price'] || row.amount);

      return {
        order_id: toStr(row.order_id || row['Order ID'] || row.orderId, `ORD-${idx + 1}`),
        order_date: toStr(row.order_date || row['Return Date'] || row.return_date || row.orderDate, null),
        sku: toStr(row.sku || row.SKU || row.product_sku || row.product_id || row['Product ID'], 'UNKNOWN_SKU'),
        product_name: toStr(row.product_name || row['Product Name'] || row.productName || row.name, null),
        product_category: toStr(row.product_category || row.category || row['Category'], 'UNKNOWN_CATEGORY'),
        product_variant: toStr(row.product_variant || row.variant || null, null),
        size: toStr(row.size, null),
        order_value,
        order_status: toStr(row.order_status || row.status, journey_outcome),
        journey_outcome,
        return_reason_raw: toStr(row.return_reason_raw || row.reason_text || row.reason || row['Return Reason'], ''),
        customer_comment: toStr(row.customer_comment || row.comment || row['Customer Comment'] || row.customer_feedback, ''),
        rto_reason_raw: toStr(row.rto_reason_raw || row.rto_reason, ''),
        is_rto,
        payment_method: normalizePayment(row.payment_method || row.paymentMethod || row.payment || (toBool(row.cod_flag || row.is_cod) ? 'COD' : undefined)),
        courier: toStr(row.courier || row.courier_partner || row.logistics_partner || row.courierPartner, 'UNKNOWN_COURIER'),
        pincode: toStr(row.pincode || row.pin_code || row.zip || row.zipcode, 'UNKNOWN_PINCODE'),
        shipping_zone: toStr(row.shipping_zone || row.zone, 'UNKNOWN_ZONE'),
        delivery_attempts: toNum(row.delivery_attempts || row.attempts),
        dispatch_delay_days: toNum(row.dispatch_delay_days),
        delivery_delay_days: toNum(row.delivery_delay_days),
        customer_type: toStr(row.customer_type, 'UNKNOWN'),
        is_first_order: toBool(row.is_first_order || row.first_order),
        refund_amount: toNum(row.refund_amount),
        forward_shipping_cost: toNum(row.forward_shipping_cost),
        return_shipping_cost: toNum(row.return_shipping_cost),
        discount_amount: toNum(row.discount_amount),
        warehouse: toStr(row.warehouse, null)
      };
    });

    const clientRunId = 'rs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const merchantId = req.user?.company_name || req.user?.email || 'unspecified_merchant';

    const canonicalPayload = {
      returns: normalizedReturns,
      order_summary: req.body?.order_summary || null,
      request_context: {
        merchant_id: merchantId,
        source: req.file ? 'csv' : 'api',
        client_run_id: clientRunId
      }
    };

    // Dispatch to published n8n Workflow 1
    const analysisResult = await n8nClient.analyzeBatch(canonicalPayload);
    const finalRunId = analysisResult.run?.id || clientRunId;

    // Persist Run in Database with explicit data_source provenance
    const runRecord = {
      id: finalRunId,
      merchant_id: merchantId,
      created_at: new Date().toISOString(),
      source: req.file ? 'csv' : 'api',
      data_source: req.file ? 'uploaded' : 'api',
      status: analysisResult.run?.status || 'success',
      records_count: normalizedReturns.length,
      analysis_confidence: analysisResult.run?.analysis_confidence || 'medium',
      intelligence_source: analysisResult.intelligence_source || 'n8n'
    };

    db.runs = [runRecord, ...(db.runs || []).filter(r => r.id !== finalRunId)];
    
    // Store full structured Analysis JSON
    db.analyses = [
      { run_id: finalRunId, analysis: analysisResult, created_at: new Date().toISOString() },
      ...(db.analyses || []).filter(a => a.run_id !== finalRunId)
    ];

    // Map individual return items for table view with per-record NLP classification
    const tableItems = normalizedReturns.map((r) => {
      const cls = classifyCustomerReturn(r.customer_comment, r.return_reason_raw || r.rto_reason_raw, r.product_name, r.product_category);

      return {
        _id: uuidv4(),
        id: r.order_id,
        order_id: r.order_id,
        sku: r.sku,
        product_name: r.product_name || r.sku,
        category: r.product_category,
        detected_reason: cls.ai_reason_category,
        ai_reason_category: cls.ai_reason_category,
        ai_root_cause: cls.ai_root_cause || analysisResult.root_causes?.[0]?.likely_cause || analysisResult.hypotheses?.[0]?.hypothesis || 'Identified via run analysis',
        confidence_score: cls.ai_confidence || 0.90,
        order_value: r.order_value,
        customer_city: r.pincode !== 'UNKNOWN_PINCODE' ? `PIN ${r.pincode}` : 'Unknown Location',
        return_date: r.order_date || new Date().toISOString(),
        status: 'analyzed',
        logistics_partner: r.courier,
        customer_comment: r.customer_comment,
        run_id: finalRunId,
        is_rto: r.is_rto
      };
    });

    db.returns = [...tableItems, ...(db.returns || [])];

    // Store Recommendations
    if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
      db.recommendations = analysisResult.recommendations.map(rec => ({
        id: rec.id || `REC-${Math.floor(100 + Math.random() * 900)}`,
        run_id: finalRunId,
        title: rec.action,
        action: rec.action,
        target: rec.target,
        reason: rec.reason,
        rationale: rec.reason,
        evidence: rec.evidence,
        evidence_summary: rec.evidence,
        expected_metric: rec.expected_metric,
        priority: rec.priority || rec.priority_tier || 'P1',
        confidence: rec.confidence || 0.85,
        status: 'todo',
        requires_human_approval: !!rec.requires_human_approval,
        approval_reason: rec.approval_reason || null,
        measurement_plan: rec.measurement_plan || null,
        created_at: new Date().toISOString()
      }));
    }

    saveDb();

    res.status(200).json({
      message: `Analysis completed successfully via ${analysisResult.intelligence_source.toUpperCase()}.`,
      run_id: finalRunId,
      total_records: normalizedReturns.length,
      valid_records: normalizedReturns.length,
      warnings: rawItems.length > 5000 ? [`Input exceeded 5,000 rows. Capped to 5,000 records.`] : 0,
      data: analysisResult
    });
  } catch (err) {
    console.error('Error importing returns:', err);
    res.status(500).json({ message: err.message });
  }
};

export const createSingleReturn = async (req, res) => {
  try {
    const db = getDb();
    const item = req.body;
    const cls = classifyCustomerReturn(item.customer_comment, item.return_reason_raw, item.product_name, item.category);

    const newRecord = {
      _id: uuidv4(),
      id: item.order_id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      order_id: item.order_id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      sku: item.sku || item.product_id || 'UNKNOWN_SKU',
      product_name: item.product_name || 'Unspecified Product',
      category: item.category || 'General',
      detected_reason: cls.ai_reason_category,
      ai_reason_category: cls.ai_reason_category,
      ai_root_cause: cls.ai_root_cause,
      confidence_score: cls.ai_confidence,
      order_value: toNum(item.product_price || item.order_value),
      customer_city: item.city || (item.pincode ? `PIN ${item.pincode}` : 'Unknown Location'),
      return_date: new Date().toISOString(),
      status: 'analyzed',
      customer_comment: item.customer_comment || '',
      logistics_partner: item.courier || 'UNKNOWN_COURIER'
    };

    db.returns.unshift(newRecord);
    saveDb();

    res.status(201).json({ message: 'Return created and analyzed', data: newRecord });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const seedDemoData = async (req, res) => {
  try {
    const seed = getInitialSeedData();
    const db = getDb();
    
    db.users = seed.users;
    db.returns = seed.returns;
    db.integrations = seed.integrations;

    const canonicalPayload = {
      returns: seed.returns.map(r => ({
        order_id: r.order_id,
        order_date: r.return_date,
        sku: r.sku || r.product_id,
        product_name: r.product_name,
        product_category: r.category,
        order_value: r.order_value || r.product_price,
        order_status: r.is_rto ? 'rto' : 'returned',
        journey_outcome: r.is_rto ? 'rto' : 'returned',
        return_reason_raw: r.return_reason_raw || '',
        customer_comment: r.customer_comment || '',
        is_rto: !!r.is_rto,
        payment_method: r.payment_method || 'COD',
        courier: r.logistics_partner || 'Delhivery',
        pincode: r.pincode || '305001',
        shipping_zone: 'North',
        delivery_attempts: r.is_rto ? 3 : 1
      })),
      order_summary: {
        total_shipped_orders: 480,
        total_delivered_orders: 430,
        cod_shipped_orders: 280,
        prepaid_shipped_orders: 200
      },
      request_context: {
        merchant_id: req.user?.company_name || 'BharatThreads Lifestyle Pvt. Ltd.',
        source: 'seed_demo',
        client_run_id: 'rs_demo_seed_001'
      }
    };

    const analysisResult = await n8nClient.analyzeBatch(canonicalPayload);
    const runId = 'rs_demo_seed_001';

    db.runs = [{
      id: runId,
      merchant_id: req.user?.company_name || 'BharatThreads Lifestyle Pvt. Ltd.',
      created_at: new Date().toISOString(),
      source: 'seed_demo',
      data_source: 'demo',
      status: analysisResult.run?.status || 'success',
      records_count: seed.returns.length,
      analysis_confidence: analysisResult.data_quality?.analysis_confidence || 'high',
      intelligence_source: analysisResult.intelligence_source || 'n8n'
    }];

    db.analyses = [{ run_id: runId, analysis: analysisResult, created_at: new Date().toISOString() }];

    if (analysisResult.recommendations) {
      db.recommendations = analysisResult.recommendations.map(rec => ({
        id: rec.id || `REC-${Math.floor(100 + Math.random() * 900)}`,
        run_id: runId,
        title: rec.action,
        action: rec.action,
        target: rec.target,
        reason: rec.reason,
        rationale: rec.reason,
        evidence: rec.evidence,
        evidence_summary: rec.evidence,
        expected_metric: rec.expected_metric,
        priority: rec.priority || rec.priority_tier || 'P1',
        confidence: rec.confidence || 0.90,
        status: 'todo',
        requires_human_approval: !!rec.requires_human_approval,
        approval_reason: rec.approval_reason || null,
        measurement_plan: rec.measurement_plan || null,
        created_at: new Date().toISOString()
      }));
    }

    saveDb();

    res.json({
      message: 'Demo dataset successfully loaded and analyzed.',
      returnsCount: db.returns.length,
      run_id: runId,
      intelligence_source: analysisResult.intelligence_source
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.returns = (db.returns || []).filter(r => r._id !== id && r.id !== id);
    saveDb();
    res.json({ message: 'Return record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearAllReturns = async (req, res) => {
  try {
    const db = getDb();
    db.returns = [];
    db.product_stats = [];
    db.recommendations = [];
    db.runs = [];
    db.analyses = [];
    saveDb();
    res.json({ message: 'All returns and analyses cleared.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
