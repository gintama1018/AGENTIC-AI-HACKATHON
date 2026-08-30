const RAW_URL = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE = RAW_URL ? (RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/$/, '')}/api`) : '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('returnshield_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['X-Demo-Mode'] = 'true';
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  signup: async (data) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Signup failed');
    }
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  // Returns
  getReturns: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/returns?${query}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch returns');
    return res.json();
  },

  getReturnById: async (id) => {
    const res = await fetch(`${API_BASE}/returns/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Return record not found');
    return res.json();
  },

  createReturn: async (returnData) => {
    const res = await fetch(`${API_BASE}/returns/single`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(returnData)
    });
    if (!res.ok) throw new Error('Failed to create return record');
    return res.json();
  },

  importReturns: async (formData) => {
    const res = await fetch(`${API_BASE}/returns/import`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Import failed');
    }
    return res.json();
  },

  seedDemoData: async () => {
    const res = await fetch(`${API_BASE}/returns/seed-demo`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to seed demo data');
    return res.json();
  },

  clearAllData: async () => {
    const res = await fetch(`${API_BASE}/returns/clear-all`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear database');
    return res.json();
  },

  exportReturns: async (format = 'csv') => {
    try {
      const res = await api.getReturns({ limit: 1000 });
      const returns = res.data || [];
      if (returns.length === 0) return;

      const headers = ['Order ID', 'Date', 'SKU', 'Product Name', 'Category', 'Reason', 'Root Cause', 'Confidence', 'Order Value (INR)', 'City', 'Courier'];
      const csvRows = [
        headers.join(','),
        ...returns.map(r => [
          r.order_id,
          r.return_date,
          `"${r.sku || ''}"`,
          `"${r.product_name || ''}"`,
          `"${r.category || ''}"`,
          `"${r.ai_reason_category || r.detected_reason || ''}"`,
          `"${(r.ai_root_cause || '').replace(/"/g, '""')}"`,
          r.confidence_score,
          r.order_value,
          `"${r.customer_city || ''}"`,
          `"${r.logistics_partner || ''}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `returnshield_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    }
  },

  // Analytics (Direct from n8n run analysis)
  getOverviewAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load overview analytics');
    return res.json();
  },

  getDashboardStats: async () => {
    const res = await api.getOverviewAnalytics();
    const metrics = res.metrics || {};
    return {
      data: {
        total_returns: metrics.totalReturns ?? 0,
        total_rto: metrics.totalRto ?? 0,
        total_events: metrics.totalEvents ?? 0,
        return_rate: metrics.returnRate ?? null,
        rto_rate: metrics.rtoRate ?? null,
        rates_available: !!metrics.ratesAvailable,
        top_reason: metrics.topReason || 'No return events analyzed',
        top_reason_count: res.reasonDistribution?.[0]?.count ?? 0,
        total_financial_loss: metrics.totalFinancialLoss ?? 0,
        avg_confidence: metrics.avgConfidence ?? 85,
        run_id: metrics.runId || 'uninitialized',
        intelligence_source: metrics.intelligenceSource || 'n8n',
        verification_passed: metrics.verificationPassed ?? true,
        top_problems: res.topProblems || [],
        hypotheses: res.hypotheses || [],
        verification: res.verification || { status: 'passed' },
        trends: res.trends || [],
        reason_distribution: res.reasonDistribution || [],
        recent_returns: res.recentReturns || []
      },
      ...res
    };
  },

  getPatternAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/patterns`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load pattern trends');
    return res.json();
  },

  getProductAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/products`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load product analytics');
    return res.json();
  },

  getProducts: async () => {
    return api.getProductAnalytics();
  },

  getFinancialImpact: async () => {
    const res = await fetch(`${API_BASE}/analytics/financial-impact`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load financial impact');
    return res.json();
  },

  // Ask ReturnShield Conversational Agent (Workflow 2)
  askReturnShield: async (question, runId = null) => {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, run_id: runId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ask Agent failed to answer');
    }
    return res.json();
  },

  // Recommendations & Human-in-the-Loop Approvals (Workflow 3)
  getRecommendations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations?${query}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
  },

  approveRecommendation: async (id, note = '', recordedBy = '') => {
    const res = await fetch(`${API_BASE}/recommendations/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ note, recorded_by: recordedBy })
    });
    if (!res.ok) throw new Error('Failed to approve recommendation');
    return res.json();
  },

  updateRecommendation: async (id, data) => {
    const res = await fetch(`${API_BASE}/recommendations/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update recommendation status');
    return res.json();
  },

  // Settings & Integrations
  getIntegrations: async () => {
    const res = await fetch(`${API_BASE}/settings/integrations`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load integrations');
    return res.json();
  },

  updateIntegrations: async (data) => {
    const res = await fetch(`${API_BASE}/settings/integrations`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update integrations');
    return res.json();
  },

  testWebhook: async (webhookUrl) => {
    const res = await fetch(`${API_BASE}/settings/test-webhook`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ webhook_url: webhookUrl })
    });
    return res.json();
  }
};
