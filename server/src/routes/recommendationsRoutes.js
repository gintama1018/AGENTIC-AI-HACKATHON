import express from 'express';
import { 
  getRecommendations, 
  updateRecommendationStatus, 
  createRecommendation 
} from '../controllers/recommendationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getRecommendations);
router.patch('/:id', authMiddleware, updateRecommendationStatus);
router.post('/', authMiddleware, createRecommendation);

export default router;
