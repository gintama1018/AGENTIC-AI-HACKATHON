import fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';
import { processReturnBatch, recalculateStatsAndRecommendations } from '../services/aiEngine.js';
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
        (r.ai_reason_category && r.ai_reason_category.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      returns = returns.filter(r => r.ai_reason_category === category || r.category === category);
    }

    if (status && status !== 'All') {
      returns = returns.filter(r => r.status === status);
    }

    if (product_id && product_id !== 'All') {
      returns = returns.filter(r => r.product_id === product_id);
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
    const returnItem = (db.returns || []).find(r => r._id === id || r.order_id === id);

    if (!returnItem) {
      return res.status(404).json({ message: 'Return record not found' });
    }

    // Related product stats context
    const productStats = (db.product_stats || []).find(p => p.product_id === returnItem.product_id);
    
    // Related items with same product
    const relatedReturns = (db.returns || [])
      .filter(r => r.product_id === returnItem.product_id && r._id !== returnItem._id)
      .slice(0, 5);

    // Matching recommendation
    const matchingRec = (db.recommendations || []).find(rec => rec.product_id === returnItem.product_id);

    res.json({
      data: returnItem,
      productStats: productStats || null,
      relatedReturns,
      recommendation: matchingRec || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const importReturns = async (req, res) => {
  try {
    const db = getDb();
    const integration = db.integrations?.[0] || null;
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

      // Cleanup uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}

      rawItems = results.map(row => ({
        _id: uuidv4(),
        user_id: req.user?._id || 'user_demo_001',
        order_id: row.order_id || row['Order ID'] || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name: row.customer_name || row['Customer Name'] || 'Customer',
        product_id: row.product_id || row['Product ID'] || row.sku || 'SKU-GEN',
        product_name: row.product_name || row['Product Name'] || 'E-Commerce Product',
        category: row.category || row['Category'] || 'General',
        product_price: parseFloat(row.product_price || row.price || row['Price'] || 49.99),
        customer_comment: row.customer_comment || row['Customer Comment'] || row.comment || row.notes || '',
        return_reason_raw: row.return_reason_raw || row['Return Reason'] || row.reason || 'General Return',
        return_date: row.return_date || row['Return Date'] || new Date().toISOString(),
        created_at: new Date().toISOString()
      }));
    } else if (req.body && Array.isArray(req.body.returns)) {
      rawItems = req.body.returns.map(item => ({
        _id: uuidv4(),
        user_id: req.user?._id || 'user_demo_001',
        order_id: item.order_id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name: item.customer_name || 'Customer',
        product_id: item.product_id || 'SKU-GEN',
        product_name: item.product_name || 'E-Commerce Product',
        category: item.category || 'General',
        product_price: parseFloat(item.product_price || 49.99),
        customer_comment: item.customer_comment || '',
        return_reason_raw: item.return_reason_raw || 'General Return',
        return_date: item.return_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      }));
    } else {
      return res.status(400).json({ message: 'No file or returns array provided' });
    }

    if (rawItems.length === 0) {
      return res.status(400).json({ message: 'No valid return records found in payload' });
    }

    // Process returns through AI engine (n8n or built-in fallback)
    const analyzedReturns = await processReturnBatch(rawItems, integration);

    // Save into database
    db.returns = [...analyzedReturns, ...(db.returns || [])];
    saveDb();

    res.status(200).json({
      message: `Successfully processed and analyzed ${analyzedReturns.length} return records.`,
      processedCount: analyzedReturns.length,
      sampleResults: analyzedReturns.slice(0, 5)
    });
  } catch (err) {
    console.error('Error importing returns:', err);
    res.status(500).json({ message: err.message });
  }
};

export const createSingleReturn = async (req, res) => {
  try {
    const {
      order_id,
      customer_name,
      product_id,
      product_name,
      category,
      product_price,
      customer_comment,
      return_reason_raw
    } = req.body;

    const db = getDb();
    const integration = db.integrations?.[0] || null;

    const singleItem = [{
      _id: uuidv4(),
      user_id: req.user?._id || 'user_demo_001',
      order_id: order_id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customer_name: customer_name || 'Direct Customer',
      product_id: product_id || 'SKU-GEN',
      product_name: product_name || 'Product SKU',
      category: category || 'Apparel',
      product_price: parseFloat(product_price || 49.99),
      customer_comment: customer_comment || '',
      return_reason_raw: return_reason_raw || 'Size mismatch',
      return_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }];

    const [analyzed] = await processReturnBatch(singleItem, integration);

    db.returns.unshift(analyzed);
    saveDb();

    res.status(201).json({
      message: 'Return submitted and analyzed in real-time.',
      data: analyzed
    });
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

    // Recalculate stats and recommendations
    await recalculateStatsAndRecommendations();

    res.json({
      message: 'Demo dataset successfully loaded with 50+ realistic returns, trends, and recommendations.',
      returnsCount: db.returns.length,
      productsCount: db.product_stats.length,
      recommendationsCount: db.recommendations.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.returns = (db.returns || []).filter(r => r._id !== id);
    await recalculateStatsAndRecommendations();
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
    saveDb();
    res.json({ message: 'All returns and stats cleared.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
