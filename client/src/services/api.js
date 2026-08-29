const API_BASE = '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('returnshield_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
      const err = await res.json();
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
      const err = await res.json();
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
    if (!res.ok) throw new Error('Failed to fetch return details');
    return res.json();
  },

  importReturns: async (formDataOrFile) => {
    let body = formDataOrFile;
    if (formDataOrFile instanceof File) {
      body = new FormData();
      body.append('file', formDataOrFile);
    }
    const res = await fetch(`${API_BASE}/returns/import`, {
      method: 'POST',
      headers: getHeaders(true),
      body
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Import failed');
    }
    return res.json();
  },

  importReturnsCsv: async (file) => {
    return api.importReturns(file);
  },

  createSingleReturn: async (data) => {
    const res = await fetch(`${API_BASE}/returns/single`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit return');
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

  clearAllReturns: async () => {
    const res = await fetch(`${API_BASE}/returns/clear-all`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear returns');
    return res.json();
  },

  deleteReturn: async (id) => {
    const res = await fetch(`${API_BASE}/returns/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete return');
    return res.json();
  },

  exportReturns: async () => {
    try {
      const res = await fetch(`${API_BASE}/returns?limit=500`, {
        headers: getHeaders()
      });
      const json = await res.json();
      const records = json.data || [];
      if (records.length === 0) return;

      const headers = ['id', 'order_id', 'product_name', 'sku', 'category', 'detected_reason', 'confidence_score', 'order_value', 'customer_city', 'return_date', 'status'];
      const csvRows = [
        headers.join(','),
        ...records.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `returns_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    }
  },

  // Analytics
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
        total_returns: metrics.totalReturns || 0,
        return_rate: metrics.rtoRate || 12.4,
        top_reason: metrics.topReason || 'Size & Fit Mismatch',
        top_reason_count: res.reasonDistribution?.[0]?.count || 17,
        total_financial_loss: metrics.totalFinancialLoss || 0,
        avg_confidence: metrics.avgConfidence || 91,
        active_recommendations: metrics.activeRecommendations || 0,
        recent_returns: res.recentReturns || [],
        reason_distribution: res.reasonDistribution || [],
        volume_timeline: res.volumeTimeline || []
      },
      ...res
    };
  },

  getPatternAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/patterns`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load pattern trends');
    const json = await res.json();
    return {
      ...json,
      weekly_trends: (json.weeklyTrendData || []).map(w => ({
        week: w.week,
        fit: w['Size & Fit Mismatch'] || 0,
        quality: w['Quality / Manufacturing Defect'] || 0,
        listing: w['Listing & Color Variance'] || 0,
        logistics: w['Logistics & Transit Damage'] || 0,
        total: w.total || 0
      }))
    };
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

  // Recommendations / Actions
  getRecommendations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations?${query}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
  },

  updateRecommendationStatus: async (id, status, notes = '') => {
    const res = await fetch(`${API_BASE}/recommendations/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to update recommendation');
    return res.json();
  },

  updateRecommendation: async (id, data = {}) => {
    const status = typeof data === 'string' ? data : data.status;
    const notes = data.notes || '';
    return api.updateRecommendationStatus(id, status, notes);
  },

  createRecommendation: async (data) => {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create recommendation');
    return res.json();
  },

  // Integrations & Settings
  getIntegrations: async () => {
    const res = await fetch(`${API_BASE}/settings/integration`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  updateIntegrations: async (data) => {
    const res = await fetch(`${API_BASE}/settings/integration`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  testWebhookConnection: async (url = 'http://localhost:5678/webhook/returnshield-analyze') => {
    const res = await fetch(`${API_BASE}/settings/test-webhook`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ webhook_url: url })
    });
    if (!res.ok) throw new Error('Webhook test failed');
    return res.json();
  },

  triggerN8nWebhook: async (data = {}) => {
    return api.testWebhookConnection(data.url);
  }
};
