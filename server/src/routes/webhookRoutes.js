import express from 'express';
import { handleWebhookResults } from '../controllers/webhookController.js';

const router = express.Router();

// n8n or external pipelines POST analyzed results here
router.post('/results', handleWebhookResults);

export default router;
