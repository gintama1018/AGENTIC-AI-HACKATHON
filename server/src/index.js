import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, getDb } from './config/db.js';
import { getInitialSeedData } from './data/seedData.js';

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

// Initialize DB and Seed Data
const startServer = async () => {
  try {
    await initDb();
    
    const db = getDb();
    if (!db.returns || db.returns.length === 0) {
      console.log('🌱 Seeding initial return records and e-commerce analytics...');
      const seed = getInitialSeedData();
      db.users = seed.users;
      db.returns = seed.returns;
      db.integrations = seed.integrations;
      console.log(`✅ Seeded ${db.returns.length} returns and initial state.`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 ReturnShield AI Production Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
