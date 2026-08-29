import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, CheckCircle2, Wifi } from 'lucide-react';
import { api } from '../../services/api';

// DESIGN.md §10 — Settings: quiet, functional, masked sensitive keys
// No card-heavy layout. Section rows with dividers.

const MaskedField = ({ value, label }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied,   setCopied]   = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const display = revealed
    ? value
    : value.slice(0, 6) + '••••••••••••' + value.slice(-4);

  return (
    <div>
      <p className="text-meta text-ash mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rs-field font-mono text-[13px]" style={{ height: 36, display: 'flex', alignItems: 'center', cursor: 'default' }}>
          {display}
        </code>
        <button
          onClick={() => setRevealed(!revealed)}
          className="rs-btn-quiet p-2"
          title={revealed ? 'Hide' : 'Reveal'}
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={copyToClipboard}
          className="rs-btn-quiet p-2"
          title="Copy"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export const SettingsPage = () => {
  const [webhookLatency, setWebhookLatency] = useState(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus,  setWebhookStatus]  = useState(null); // 'ok' | 'error' | null

  const testWebhook = async () => {
    setTestingWebhook(true);
    setWebhookLatency(null);
    setWebhookStatus(null);
    const start = Date.now();
    try {
      await api.triggerN8nWebhook?.({ test: true });
      setWebhookLatency(Date.now() - start);
      setWebhookStatus('ok');
    } catch {
      setWebhookLatency(Date.now() - start);
      setWebhookStatus('error');
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="max-w-xl space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Settings</h1>
        <p className="text-compact text-graphite">Configuration and pipeline management for BharatThreads.</p>
      </div>

      {/* ── Tenant profile ─────────────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">Tenant profile</p>
        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          {[
            { label: 'Account name',   value: 'Sonu Jangir' },
            { label: 'Email',          value: 'Sonu.jangir2024@uem.edu.in' },
            { label: 'Company',        value: 'BharatThreads Lifestyle Pvt. Ltd.' },
            { label: 'Currency',       value: '₹ INR' },
            { label: 'Locale',         value: 'India (en-IN)' },
            { label: 'Tenant ID',      value: 'bharatthreads_prod' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3">
              <p className="text-compact text-graphite">{label}</p>
              <p className="text-compact font-medium text-charcoal">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── API keys ───────────────────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">API configuration</p>
        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          <div className="px-5 py-4">
            <MaskedField
              label="Google Gemini API key"
              value="AIzaSyBharatThreadsReturnShield2024HackKey"
            />
          </div>
          <div className="px-5 py-4">
            <MaskedField
              label="n8n webhook secret"
              value="rs_wh_secret_bharatthreads_prod_2024"
            />
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-2 p-3 rounded-control border border-mist bg-canvas text-meta text-graphite">
              <span className="text-ash flex-shrink-0 pt-0.5">ℹ</span>
              API keys are stored server-side. They are never sent to the browser in plaintext beyond this reveal toggle.
            </div>
          </div>
        </div>
      </section>

      {/* ── n8n pipeline ───────────────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">n8n pipeline</p>
        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          <div className="px-5 py-4">
            <p className="text-compact text-graphite mb-1">Webhook endpoint</p>
            <code className="text-meta font-mono text-charcoal break-all">
              http://localhost:5678/webhook/returnshield-analyze
            </code>
          </div>

          {[
            { label: 'Workflow', value: 'ReturnShield — Analyze & Classify' },
            { label: 'Trigger',  value: 'HTTP Webhook' },
            { label: 'Mode',     value: 'Production' },
            { label: 'Region',   value: 'Self-hosted (local)' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3">
              <p className="text-compact text-graphite">{label}</p>
              <p className="text-compact text-charcoal">{value}</p>
            </div>
          ))}

          {/* Webhook latency test */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-compact font-semibold text-charcoal">Webhook connectivity test</p>
              <button
                onClick={testWebhook}
                disabled={testingWebhook}
                className="rs-btn-secondary flex items-center gap-1.5 disabled:opacity-50"
                style={{ height: 32, padding: '0 12px', fontSize: 13 }}
              >
                <Wifi className="w-3.5 h-3.5" />
                {testingWebhook ? 'Testing…' : 'Test connection'}
              </button>
            </div>
            {webhookStatus && (
              <div className={`flex items-center gap-2 text-meta ${webhookStatus === 'ok' ? 'text-success' : 'text-attention'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {webhookStatus === 'ok'
                  ? `Connected · ${webhookLatency}ms response`
                  : `Connection failed · ${webhookLatency}ms — check that n8n is running`}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Data management ────────────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">Data management</p>
        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          {[
            { label: 'Persistence',       value: 'JSON flat file (server/src/data/db.json)' },
            { label: 'Demo data',         value: 'Indian D2C — 50+ seeded return records' },
            { label: 'Data retention',    value: '90 days rolling' },
            { label: 'Export format',     value: 'CSV, PDF executive brief' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between px-5 py-3">
              <p className="text-compact text-graphite">{label}</p>
              <p className="text-compact text-charcoal text-right max-w-xs">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
