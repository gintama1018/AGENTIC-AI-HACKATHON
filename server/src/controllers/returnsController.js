import fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';
import { n8nClient } from '../services/n8nClient.js';
import { getInitialSeedData } from '../data/seedData.js';

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
 * CSV Upload -> Normalize -> Canonical n8n Payload -> Dispatch to Workflow 1 -> Validate & Store -> Return to UI
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

    // Build Canonical n8n Payload
    const normalizedReturns = rawItems.map((row) => {
      const order_value = Number(String(row.order_value || row.product_price || row.price || row['Price'] || 1499).replace(/[^\d.]/g, '')) || 1499;
      const is_rto = String(row.is_rto || row.journey_outcome || row.order_status || '').toLowerCase().includes('rto');
      const journey_outcome = is_rto ? 'rto' : (String(row.journey_outcome || row.order_status || 'returned').toLowerCase());

      return {
        order_id: String(row.order_id || row['Order ID'] || `ORD-${Math.floor(10000 + Math.random() * 90000)}`),
        order_date: row.order_date || row['Return Date'] || row.return_date || new Date().toISOString(),
        sku: String(row.sku || row.product_id || row['Product ID'] || 'BT-KRS-SG-M'),
        product_name: String(row.product_name || row['Product Name'] || 'Kurta Set Sage Green'),
        product_category: String(row.category || row.product_category || 'Apparel'),
        product_variant: String(row.size || row.variant || 'M'),
        size: String(row.size || 'M'),
        order_value,
        order_status: is_rto ? 'rto' : 'returned',
        journey_outcome,
        return_reason_raw: String(row.return_reason_raw || row.reason || row['Return Reason'] || 'Size mismatch'),
        customer_comment: String(row.customer_comment || row.comment || row['Customer Comment'] || row.customer_feedback || ''),
        rto_reason_raw: String(row.rto_reason_raw || (is_rto ? 'Customer unreachable / refused delivery' : '')),
        is_rto,
        payment_method: String(row.payment_method || (row.is_cod ? 'COD' : 'COD')),
        courier: String(row.courier || row.logistics_partner || 'Delhivery'),
        pincode: String(row.pincode || row.pin_code || '305001'),
        shipping_zone: String(row.shipping_zone || row.zone || 'North'),
        delivery_attempts: Number(row.delivery_attempts) || 1,
        dispatch_delay_days: Number(row.dispatch_delay_days) || 0,
        delivery_delay_days: Number(row.delivery_delay_days) || 0,
        customer_type: String(row.customer_type || 'Retail'),
        refund_amount: order_value,
        forward_shipping_cost: 120,
        return_shipping_cost: 90,
        discount_amount: 0,
        warehouse: String(row.warehouse || 'Bhiwandi-W1')
      };
    });

    const clientRunId = 'rs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

    const canonicalPayload = {
      returns: normalizedReturns,
      order_summary: req.body?.order_summary || null, // Optional honest denominator
      request_context: {
        merchant_id: req.user?.company_name || 'bharatthreads_prod',
        source: req.file ? 'csv' : 'api',
        client_run_id: clientRunId
      }
    };

    // Dispatch to published n8n Workflow 1
    const analysisResult = await n8nClient.analyzeBatch(canonicalPayload);
    const finalRunId = analysisResult.run?.id || clientRunId;

    // Persist Run in Database
    const runRecord = {
      id: finalRunId,
      merchant_id: req.user?.company_name || 'bharatthreads_prod',
      created_at: new Date().toISOString(),
      source: req.file ? 'csv' : 'api',
      status: analysisResult.run?.status || 'success',
      records_count: normalizedReturns.length,
      analysis_confidence: analysisResult.run?.analysis_confidence || 'high',
      intelligence_source: analysisResult.intelligence_source || 'n8n'
    };

    db.runs = [runRecord, ...(db.runs || []).filter(r => r.id !== finalRunId)];
    
    // Store full structured Analysis JSON
    db.analyses = [
      { run_id: finalRunId, analysis: analysisResult, created_at: new Date().toISOString() },
      ...(db.analyses || []).filter(a => a.run_id !== finalRunId)
    ];

    // Map individual return items for table view
    const tableItems = normalizedReturns.map((r, i) => ({
      _id: uuidv4(),
      id: r.order_id,
      order_id: r.order_id,
      sku: r.sku,
      product_name: r.product_name,
      category: r.product_category,
      detected_reason: r.return_reason_raw || 'Size & Fit Mismatch',
      ai_reason_category: r.return_reason_raw || 'Size & Fit Mismatch',
      ai_root_cause: analysisResult.root_causes?.[0]?.likely_cause || 'Pattern identified during run analysis',
      confidence_score: 0.91,
      order_value: r.order_value,
      customer_city: r.pincode ? `PIN ${r.pincode}` : 'Jaipur',
      return_date: r.order_date,
      status: 'analyzed',
      logistics_partner: r.courier,
      customer_comment: r.customer_comment,
      run_id: finalRunId
    }));

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
        priority: rec.priority || 'P0',
        confidence: rec.confidence || 0.90,
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
      warnings: 0,
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
    const newRecord = {
      _id: uuidv4(),
      id: item.order_id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      order_id: item.order_id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      sku: item.sku || item.product_id || 'BT-KRS-SG-M',
      product_name: item.product_name || 'Kurta Set Sage Green',
      category: item.category || 'Apparel',
      detected_reason: item.return_reason_raw || 'Size & Fit Mismatch',
      confidence_score: 0.92,
      order_value: Number(item.product_price) || 1890,
      customer_city: item.city || 'Jaipur',
      return_date: new Date().toISOString(),
      status: 'analyzed',
      customer_comment: item.customer_comment || '',
      logistics_partner: item.courier || 'Delhivery'
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

    // Build canonical payload from seed returns and run through analysis pipeline
    const canonicalPayload = {
      returns: seed.returns.map(r => ({
        order_id: r.order_id,
        order_date: r.return_date,
        sku: r.sku || r.product_id || 'BT-KRS-SG-M',
        product_name: r.product_name,
        product_category: r.category,
        product_variant: 'M',
        size: 'M',
        order_value: r.order_value || r.product_price || 1890,
        order_status: 'returned',
        journey_outcome: 'returned',
        return_reason_raw: r.return_reason_raw || 'Size mismatch',
        customer_comment: r.customer_comment || '',
        is_rto: false,
        payment_method: 'COD',
        courier: r.logistics_partner || 'Delhivery',
        pincode: '305001',
        shipping_zone: 'North',
        delivery_attempts: 1,
        dispatch_delay_days: 0,
        delivery_delay_days: 0,
        customer_type: 'Retail',
        refund_amount: r.order_value || 1890
      })),
      order_summary: {
        total_shipped_orders: 480,
        total_delivered_orders: 430,
        cod_shipped_orders: 280,
        prepaid_shipped_orders: 200
      },
      request_context: {
        merchant_id: 'bharatthreads_prod',
        source: 'seed_demo',
        client_run_id: 'rs_demo_seed_001'
      }
    };

    const analysisResult = await n8nClient.analyzeBatch(canonicalPayload);
    const runId = 'rs_demo_seed_001';

    db.runs = [{
      id: runId,
      merchant_id: 'bharatthreads_prod',
      created_at: new Date().toISOString(),
      source: 'seed_demo',
      status: 'success',
      records_count: seed.returns.length,
      analysis_confidence: 'high',
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
        priority: rec.priority || 'P0',
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
