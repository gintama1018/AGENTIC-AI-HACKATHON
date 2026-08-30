import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, getDb, saveDb } from './config/db.js';
import { getInitialSeedData } from './data/seedData.js';
import { n8nClient } from './services/n8nClient.js';

import authRoutes from './routes/authRoutes.js';
import returnsRoutes from './routes/returnsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import recommendationsRoutes from './routes/recommendationsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import askRoutes from './routes/askRoutes.js';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable must be set in production mode.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ReturnShield AI Production Engine',
    timestamp: new Date().toISOString(),
    version: '4.0.0',
    n8n_endpoints: {
      analysis: process.env.N8N_ANALYSIS_WEBHOOK_URL ? 'configured' : 'default',
      followup: process.env.N8N_FOLLOWUP_WEBHOOK_URL ? 'configured' : 'default',
      feedback: process.env.N8N_FEEDBACK_WEBHOOK_URL ? 'configured' : 'default'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ask', askRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
  });
});

// Initialize DB and Seed Initial Analysis
const startServer = async () => {
  try {
    await initDb();
    
    const db = getDb();
    if (!db.returns || db.returns.length === 0 || !db.analyses || db.analyses.length === 0) {
      console.log('🌱 Seeding initial return records and running baseline analysis...');
      const seed = getInitialSeedData();
      db.users = seed.users;
      db.integrations = seed.integrations;

      // Realistic Indian D2C Returns + RTOs batch (50 records)
      const canonicalReturns = seed.returns.map((r, i) => {
        const isRto = i < 14;
        const courier = isRto ? 'Xpress Logistics' : (i < 28 ? 'Delhivery' : (i < 40 ? 'BlueDart' : 'Shadowfax'));
        const pincode = isRto ? '305001' : (i < 25 ? '110001' : (i < 38 ? '400001' : '560001'));
        const sku = i < 17 ? 'BT-KRS-SG-M' : (i < 28 ? 'BT-DPT-RS-OS' : (i < 38 ? 'BT-CHN-DT-32' : r.product_id));
        const productName = i < 17 ? 'Kurta Set — Sage Green' : (i < 28 ? 'Embroidered Dupatta — Rust' : (i < 38 ? "Men's Chino — Dark Teal" : r.product_name));

        return {
          order_id: r.order_id,
          order_date: r.return_date,
          sku,
          product_name: productName,
          product_category: r.category,
          product_variant: 'M',
          size: 'M',
          order_value: r.product_price || 1890,
          order_status: isRto ? 'rto' : 'returned',
          journey_outcome: isRto ? 'rto' : 'returned',
          return_reason_raw: isRto ? 'Customer unreachable / delivery rejected' : r.return_reason_raw,
          customer_comment: r.customer_comment || '',
          is_rto: isRto,
          payment_method: isRto ? 'COD' : (i % 2 === 0 ? 'COD' : 'Prepaid'),
          courier,
          pincode,
          shipping_zone: 'North',
          delivery_attempts: isRto ? 3 : 1
        };
      });

      const canonicalPayload = {
        returns: canonicalReturns,
        order_summary: {
          total_shipped_orders: 480,
          total_delivered_orders: 430,
          cod_shipped_orders: 280,
          prepaid_shipped_orders: 200
        },
        request_context: {
          merchant_id: 'bharatthreads_prod',
          source: 'seed_init',
          client_run_id: 'rs_init_baseline_001'
        }
      };

      // Route through authoritative n8nClient (uses n8n if available, otherwise honest fallback)
      const initialAnalysis = await n8nClient.analyzeBatch(canonicalPayload);
      const runId = initialAnalysis.run?.id || 'rs_init_baseline_001';

      db.runs = [{
        id: runId,
        merchant_id: 'bharatthreads_prod',
        created_at: new Date().toISOString(),
        source: 'seed_init',
        status: initialAnalysis.run?.status || 'success',
        records_count: canonicalReturns.length,
        analysis_confidence: initialAnalysis.data_quality?.analysis_confidence || 'high',
        intelligence_source: initialAnalysis.intelligence_source || 'fallback'
      }];

      db.analyses = [{ run_id: runId, analysis: initialAnalysis, created_at: new Date().toISOString() }];
      db.returns = canonicalReturns.map(r => ({
        _id: `ret_${r.order_id}`,
        id: r.order_id,
        order_id: r.order_id,
        sku: r.sku,
        product_name: r.product_name,
        category: r.product_category,
        detected_reason: r.return_reason_raw || 'Size & Fit Mismatch',
        ai_reason_category: r.return_reason_raw || 'Size & Fit Mismatch',
        ai_root_cause: initialAnalysis.root_causes?.[0]?.likely_cause || initialAnalysis.hypotheses?.[0]?.hypothesis || 'Identified via baseline analysis',
        confidence_score: 0.95,
        order_value: r.order_value,
        customer_city: `PIN ${r.pincode}`,
        return_date: r.order_date,
        status: 'analyzed',
        logistics_partner: r.courier,
        customer_comment: r.customer_comment,
        is_rto: r.is_rto
      }));

      db.recommendations = (initialAnalysis.recommendations || []).map(r => ({
        ...r,
        title: r.action,
        status: 'todo',
        created_at: new Date().toISOString()
      }));

      saveDb();
      console.log(`✅ Seeded ${db.returns.length} returns and initialized baseline run (${runId}) via ${initialAnalysis.intelligence_source.toUpperCase()}.`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 ReturnShield AI Production Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
