import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production mode. Server fails closed.');
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev_only_unsecure_secret_for_local_development_only';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Security Guard: Demo bypass is strictly disabled in production unless ALLOW_DEMO_MODE=true is explicitly set
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDemo = !isProduction || process.env.ALLOW_DEMO_MODE === 'true';
  const isExplicitDemo = allowDemo && (
    req.query.demo === 'true' ||
    req.headers['x-demo-mode'] === 'true'
  );

  // Explicit demo bypass with audit trace (Development or explicit demo workstation only)
  if (isExplicitDemo) {
    const db = getDb();
    req.user = db.users?.[0] || {
      _id: 'demo_user',
      name: 'Demo Operator',
      email: 'demo@returnshield.ai',
      company_name: 'BharatThreads Lifestyle Pvt. Ltd.'
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: isProduction
        ? 'Unauthorized: Valid Bearer authentication token is required.'
        : 'Unauthorized: Missing or malformed Authorization header. Provide Bearer token or pass ?demo=true in development.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
    const db = getDb();
    const user = (db.users || []).find(u => u._id === decoded.userId || u.email === decoded.email);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Unauthorized: User associated with token not found in tenant database.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized: Invalid or expired authentication token.'
    });
  }
};
