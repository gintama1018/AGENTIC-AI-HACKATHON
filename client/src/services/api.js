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

  importReturnsCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/returns/import`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Import failed');
    }
    return res.json();
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

  // Analytics
  getOverviewAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load overview analytics');
    return res.json();
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

  getFinancialImpact: async () => {
    const res = await fetch(`${API_BASE}/analytics/financial-impact`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load financial impact');
    return res.json();
  },

  // Recommendations
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

  testWebhookConnection: async (url) => {
    const res = await fetch(`${API_BASE}/settings/test-webhook`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ webhook_url: url })
    });
    if (!res.ok) throw new Error('Webhook test failed');
    return res.json();
  }
};
