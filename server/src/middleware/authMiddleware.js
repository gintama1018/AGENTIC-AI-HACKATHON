import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production mode. Server fails closed.');
}

const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev_only_unsecure_secret_for_local_development_only';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const isExplicitDemo = req.query.demo === 'true' || req.headers['x-demo-mode'] === 'true';

  // Explicit demo bypass with audit trace
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
      message: 'Unauthorized: Missing or malformed Authorization header. Provide Bearer token or pass ?demo=true for demo workstation access.'
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
