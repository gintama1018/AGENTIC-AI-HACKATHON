import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, getDb } from './config/db.js';
import { getInitialSeedData } from './data/seedData.js';
import { recalculateStatsAndRecommendations } from './services/aiEngine.js';

import authRoutes from './routes/authRoutes.js';
import returnsRoutes from './routes/returnsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import recommendationsRoutes from './routes/recommendationsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ReturnShield AI REST Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhook', webhookRoutes);

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
      await recalculateStatsAndRecommendations();
      console.log(`✅ Seeded ${db.returns.length} returns and ${db.product_stats?.length || 0} product diagnostics.`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 ReturnShield AI Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
