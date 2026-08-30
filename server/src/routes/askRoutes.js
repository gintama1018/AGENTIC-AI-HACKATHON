import express from 'express';
import { askQuestion } from '../controllers/askController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, askQuestion);

export default router;
