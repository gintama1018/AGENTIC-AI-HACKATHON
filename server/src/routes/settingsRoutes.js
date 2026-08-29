import express from 'express';
import { 
  getIntegrations, 
  updateIntegrations, 
  testWebhookConnection 
} from '../controllers/settingsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/integration', authMiddleware, getIntegrations);
router.put('/integration', authMiddleware, updateIntegrations);
router.post('/test-webhook', authMiddleware, testWebhookConnection);

export default router;
