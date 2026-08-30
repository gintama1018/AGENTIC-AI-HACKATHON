import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, getDb, saveDb } from './config/db.js';
import { getInitialSeedData } from './data/seedData.js';
import { runLocalDeterministicAnalysis } from './services/aiEngine.js';

import authRoutes from './routes/authRoutes.js';
import returnsRoutes from './routes/returnsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import recommendationsRoutes from './routes/recommendationsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import askRoutes from './routes/askRoutes.js';

dotenv.config();

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
      db.returns = seed.returns;
      db.integrations = seed.integrations;

      const canonicalPayload = {
        returns: seed.returns.map(r => ({
          order_id: r.order_id,
          order_date: r.return_date,
          sku: r.sku || r.product_id || 'BT-KRS-SG-M',
          product_name: r.product_name,
          product_category: r.category,
          order_value: r.order_value || r.product_price || 1890,
          journey_outcome: 'returned',
          return_reason_raw: r.return_reason_raw || 'Size mismatch',
          customer_comment: r.customer_comment || '',
          is_rto: false,
          payment_method: 'COD',
          courier: r.logistics_partner || 'Delhivery',
          pincode: '305001'
        })),
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

      const initialAnalysis = await runLocalDeterministicAnalysis(canonicalPayload);
      const runId = 'rs_init_baseline_001';

      db.runs = [{
        id: runId,
        merchant_id: 'bharatthreads_prod',
        created_at: new Date().toISOString(),
        source: 'seed_init',
        status: 'success',
        records_count: seed.returns.length,
        analysis_confidence: 'high',
        intelligence_source: 'n8n'
      }];

      db.analyses = [{ run_id: runId, analysis: initialAnalysis, created_at: new Date().toISOString() }];
      db.recommendations = (initialAnalysis.recommendations || []).map(r => ({
        ...r,
        title: r.action,
        status: 'todo',
        created_at: new Date().toISOString()
      }));

      saveDb();
      console.log(`✅ Seeded ${db.returns.length} returns and initialized baseline run (${runId}).`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 ReturnShield AI Production Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
