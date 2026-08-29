import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Save, 
  Activity, 
  Zap, 
  ShieldCheck,
  FileSpreadsheet,
  Key,
  Building,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    n8n_webhook_url: '',
    google_sheet_id: '',
    api_key: '',
    sync_interval: 'hourly',
    auto_analyze: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [testStatus, setTestStatus] = useState(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.getIntegrations();
        if (res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveNotice('');
    try {
      await api.updateIntegrations(settings);
      setSaveNotice('✅ Settings saved and updated successfully!');
      setTimeout(() => setSaveNotice(''), 3500);
    } catch (err) {
      setSaveNotice('❌ Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestStatus(null);
    try {
      const res = await api.testWebhookConnection(settings.n8n_webhook_url);
      setTestStatus(res);
    } catch (err) {
      setTestStatus({
        success: false,
        message: 'Connection failed: ' + err.message
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Integrations & Pipeline Settings</h1>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            n8n Connected
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure external n8n AI webhook endpoints, Google Sheets sync, and multi-tenant credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* n8n Webhook Configuration Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border-brand-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <div>
                <h3 className="text-sm font-bold text-white">n8n AI Engine Webhook</h3>
                <p className="text-[11px] text-slate-400">Wraps your existing "ReturnShield AI v2" workflow</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/30">
              Dual AI Engine
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              n8n Webhook Endpoint URL (POST)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={settings.n8n_webhook_url || ''}
                onChange={(e) => setSettings({ ...settings, n8n_webhook_url: e.target.value })}
                placeholder="https://your-n8n-instance.cloud/webhook/returnshield-ai-v2"
                className="flex-1 px-3.5 py-2 text-xs bg-slate-900 rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testingWebhook || !settings.n8n_webhook_url}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Activity className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
                {testingWebhook ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Whenever a return is uploaded, ReturnShield AI POSTs payloads to this n8n webhook. If offline, the built-in local NLP AI engine processes the batch automatically!
            </p>
          </div>

          {/* Test Status Output */}
          {testStatus && (
            <div className={`p-3.5 rounded-xl text-xs border ${
              testStatus.success 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {testStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                <span>{testStatus.message}</span>
              </div>
              {testStatus.note && (
                <p className="text-[11px] mt-1 text-slate-300">{testStatus.note}</p>
              )}
            </div>
          )}
        </div>

        {/* Google Sheets & API Integration */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Google Sheets & API Sync
            </h3>
            <p className="text-[11px] text-slate-400">Automate two-way return sync from customer service spreadsheets</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Google Sheet ID</label>
              <input
                type="text"
                value={settings.google_sheet_id || ''}
                onChange={(e) => setSettings({ ...settings, google_sheet_id: e.target.value })}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3.5 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ReturnShield API Ingestion Key</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={settings.api_key || 'rsh_live_9948fa812bc802f6ae4e'}
                  className="w-full px-3.5 py-2 bg-slate-900 rounded-xl border border-slate-700 text-slate-400 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Profile Information */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" /> Tenant Profile & Multi-Tenant Isolation
            </h3>
            <p className="text-[11px] text-slate-400">Your brand workspace parameters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Active Company Name:</span>
              <p className="font-bold text-white text-sm mt-0.5">{user?.company_name || 'Aurora Apparel & Goods'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Authorized Admin:</span>
              <p className="font-bold text-white text-sm mt-0.5">{user?.name || 'Sarah Jenkins'} ({user?.email || 'sarah@aurorafashion.com'})</p>
            </div>
          </div>
        </div>

        {/* Save Notice & Button */}
        <div className="flex items-center justify-between pt-2">
          {saveNotice ? (
            <p className="text-xs font-semibold text-emerald-400 animate-pulse">{saveNotice}</p>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
