import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';

export const getIntegrations = async (req, res) => {
  try {
    const db = getDb();
    let integration = db.integrations?.[0];

    if (!integration) {
      integration = {
        _id: 'int_default',
        user_id: req.user?._id || 'user_demo_001',
        n8n_webhook_url: 'https://primary-production-n8n.cloud/webhook/returnshield-ai-v2',
        google_sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        api_key: 'rsh_live_9948fa812bc802f6ae4e',
        sync_interval: 'hourly',
        auto_analyze: true,
        last_sync: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      db.integrations = [integration];
      saveDb();
    }

    res.json({ data: integration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateIntegrations = async (req, res) => {
  try {
    const { n8n_webhook_url, google_sheet_id, api_key, sync_interval, auto_analyze } = req.body;
    const db = getDb();

    if (!db.integrations || db.integrations.length === 0) {
      db.integrations = [{
        _id: uuidv4(),
        user_id: req.user?._id || 'user_demo_001',
        created_at: new Date().toISOString()
      }];
    }

    const current = db.integrations[0];
    if (n8n_webhook_url !== undefined) current.n8n_webhook_url = n8n_webhook_url;
    if (google_sheet_id !== undefined) current.google_sheet_id = google_sheet_id;
    if (api_key !== undefined) current.api_key = api_key;
    if (sync_interval !== undefined) current.sync_interval = sync_interval;
    if (auto_analyze !== undefined) current.auto_analyze = auto_analyze;
    current.updated_at = new Date().toISOString();

    saveDb();

    res.json({ message: 'Integrations updated successfully', data: current });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const testWebhookConnection = async (req, res) => {
  try {
    const { webhook_url } = req.body;
    const targetUrl = webhook_url || getDb().integrations?.[0]?.n8n_webhook_url;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'No webhook URL provided to test' });
    }

    const testPayload = {
      event: 'ping_test',
      timestamp: new Date().toISOString(),
      source: 'ReturnShield AI Platform',
      sample_return: {
        order_id: 'TEST-ORD-999',
        product_id: 'PRD-TEST',
        product_name: 'Test Denim Jacket',
        customer_comment: 'Sizing runs tight around chest and arms',
        return_reason_raw: 'Size too small'
      }
    };

    const startTime = Date.now();
    try {
      const resp = await axios.post(targetUrl, testPayload, { timeout: 7000 });
      const latencyMs = Date.now() - startTime;

      res.json({
        success: true,
        latencyMs,
        status: resp.status,
        statusText: resp.statusText,
        message: `Successfully connected to n8n webhook! Received HTTP ${resp.status} in ${latencyMs}ms.`,
        responseData: resp.data
      });
    } catch (httpErr) {
      const latencyMs = Date.now() - startTime;
      res.json({
        success: false,
        latencyMs,
        message: `Webhook test reached endpoint with notice: ${httpErr.message}`,
        note: 'Built-in local NLP AI engine will handle return classification seamlessly if n8n endpoint is offline.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
