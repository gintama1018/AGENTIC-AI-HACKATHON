import express from 'express';
import { 
  getOverview, 
  getPatterns, 
  getProducts, 
  getFinancialImpact 
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', authMiddleware, getOverview);
router.get('/patterns', authMiddleware, getPatterns);
router.get('/products', authMiddleware, getProducts);
router.get('/financial-impact', authMiddleware, getFinancialImpact);

export default router;
