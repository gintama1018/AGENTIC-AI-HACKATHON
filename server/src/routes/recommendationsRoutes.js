import express from 'express';
import {
  getRecommendations,
  updateRecommendationStatus,
  createRecommendation,
  approveRecommendation
} from '../controllers/recommendationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getRecommendations);
router.post('/', authMiddleware, createRecommendation);
router.patch('/:id', authMiddleware, updateRecommendationStatus);
router.post('/:id/approve', authMiddleware, approveRecommendation);

export default router;
