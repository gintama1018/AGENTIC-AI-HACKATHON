import express from 'express';
import {
  getRecommendations,
  updateRecommendationStatus,
  createRecommendation,
  approveRecommendation
} from '../controllers/recommendationsController.js';

const router = express.Router();

router.get('/', getRecommendations);
router.post('/', createRecommendation);
router.patch('/:id', updateRecommendationStatus);
router.post('/:id/approve', approveRecommendation);

export default router;
