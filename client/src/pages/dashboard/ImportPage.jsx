import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  ArrowRight, 
  Plus, 
  Layers, 
  Database,
  Cpu,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export const ImportPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'manual' | 'demo'

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    order_id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    customer_name: 'Alex Rivera',
    product_id: 'PRD-701',
    product_name: 'Vintage Heavyweight Denim Jacket',
    category: 'Apparel',
    product_price: '89.00',
    return_reason_raw: 'Size too small',
    customer_comment: 'Ordered a Large but fits like a tight Medium. Arms and chest are way too constricted.'
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualResult, setManualResult] = useState(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadStatus({ type: 'info', message: 'Parsing CSV and dispatching return records to AI classification engine...' });

    try {
      const res = await api.importReturnsCsv(file);
      setUploadStatus({
        type: 'success',
        message: `✅ Success! Analyzed and persisted ${res.processedCount || 'all'} return records to the database.`,
        sampleResults: res.sampleResults
      });
      setTimeout(() => {
        navigate('/dashboard/returns');
      }, 2000);
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Failed to import CSV file. Please check format.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualSubmitting(true);
    setManualResult(null);

    try {
      const res = await api.createSingleReturn(manualForm);
      setManualResult(res.data);
      // Reset order ID for next submission
      setManualForm(prev => ({
        ...prev,
        order_id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        customer_comment: ''
      }));
    } catch (err) {
      alert('Failed to submit manual return: ' + err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleLoadDemoDataset = async () => {
    setUploading(true);
    setUploadStatus({ type: 'info', message: 'Seeding comprehensive 4-week demo returns dataset...' });
    try {
      await api.seedDemoData();
      setUploadStatus({
        type: 'success',
        message: '✅ 50+ realistic e-commerce returns, trend trajectories, and recommendations loaded!'
      });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setUploadStatus({ type: 'error', message: 'Failed to seed demo data' });
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = `order_id,customer_name,product_id,product_name,category,product_price,return_reason_raw,customer_comment,return_date
ORD-90121,David Miller,PRD-701,Vintage Heavyweight Denim Jacket,Apparel,89.00,Size too small,"Arms and shoulders are too tight when buttoned.",2026-08-28
ORD-90122,Emily Chen,PRD-903,ProSound ANC Wireless Headphones,Electronics,129.99,Defective hardware,"Left earbud stopped charging after 3 days.",2026-08-27
ORD-90123,Liam Brooks,PRD-404,Ceramic Pour-Over Coffee Dripper,Home Goods,34.50,Damaged in transit,"Box arrived crushed and ceramic was chipped.",2026-08-26
ORD-90124,Sophia Patel,PRD-505,Organic Silk Pillowcase,Home Goods,58.00,Color discrepancy,"Color is much lighter than shown on listing photo.",2026-08-25`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ReturnShield_Sample_Template.csv';
    link.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Data Ingestion Studio
        </h1>
        <p className="text-xs text-slate-400">
          Feed raw returns into the AI pipeline via CSV batch, direct manual entry, or 1-click sample seed.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 glass-card rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'csv' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" /> CSV Batch Upload
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'manual' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> Manual Single Entry
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'demo' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Demo Seed
        </button>
      </div>

      {/* Status Notice */}
      {uploadStatus && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
          uploadStatus.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
          uploadStatus.type === 'error' ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' :
          'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
        }`}>
          <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* CSV Upload Tab */}
      {activeTab === 'csv' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Upload E-Commerce Return Records</h3>
              <p className="text-xs text-slate-400">Supports standard Shopify, WooCommerce, Amazon, and custom CSV exports</p>
            </div>
            <button
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
            </button>
          </div>

          {/* Drag and drop box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              file ? 'border-emerald-500/60 bg-emerald-950/10' : 'border-slate-700 hover:border-brand-500/50 bg-slate-900/50'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-brand-400 mx-auto mb-3 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-emerald-400">{(file.size / 1024).toFixed(1)} KB • Ready for AI ingestion</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                  Drag and drop your return CSV file here
                </p>
                <p className="text-[11px] text-slate-500">or click below to browse from your computer</p>
              </div>
            )}

            <label className="mt-4 inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <span className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all">
                {file ? 'Choose Different File' : 'Browse Files'}
              </span>
            </label>
          </div>

          <button
            onClick={handleCsvUpload}
            disabled={!file || uploading}
            className="w-full py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
            {uploading ? 'Dispatched to ReturnShield Engine...' : 'Run Autonomous Pipeline & Persist'}
          </button>
        </div>
      )}

      {/* Manual Single Entry Tab */}
      {activeTab === 'manual' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white">Manual Return Submission & Instant AI Diagnosis</h3>
            <p className="text-xs text-slate-400">Test the pipeline on an individual return with real-time classification response.</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Order ID</label>
                <input
                  type="text"
                  required
                  value={manualForm.order_id}
                  onChange={(e) => setManualForm({ ...manualForm, order_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={manualForm.customer_name}
                  onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualForm.product_price}
                  onChange={(e) => setManualForm({ ...manualForm, product_price: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product SKU / ID</label>
                <input
                  type="text"
                  required
                  value={manualForm.product_id}
                  onChange={(e) => setManualForm({ ...manualForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={manualForm.product_name}
                  onChange={(e) => setManualForm({ ...manualForm, product_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Raw Return Reason Selected by Buyer</label>
              <input
                type="text"
                required
                value={manualForm.return_reason_raw}
                onChange={(e) => setManualForm({ ...manualForm, return_reason_raw: e.target.value })}
                placeholder="e.g. Too small / Defective button / Color different"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Comment / Voice (Unstructured)</label>
              <textarea
                rows={3}
                required
                value={manualForm.customer_comment}
                onChange={(e) => setManualForm({ ...manualForm, customer_comment: e.target.value })}
                placeholder="Paste customer's verbatim message..."
                className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={manualSubmitting}
              className="w-full py-3 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Cpu className={`w-4 h-4 ${manualSubmitting ? 'animate-spin' : ''}`} />
              {manualSubmitting ? 'Running AI Classifier...' : 'Ingest & Trigger AI Classification'}
            </button>
          </form>

          {/* Instant Diagnosis Output */}
          {manualResult && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-brand-500/40 space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-Time AI Diagnostic Generated
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Confidence: {Math.round((manualResult.ai_confidence || 0.95) * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Classified Category:</span>
                  <p className="font-bold text-indigo-300">{manualResult.ai_reason_category}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Assigned Severity:</span>
                  <p className="font-bold text-rose-400 capitalize">{manualResult.severity} Priority</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 text-xs font-mono text-slate-200">
                <strong>Root Cause:</strong> {manualResult.ai_root_cause}
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 text-xs text-slate-200">
                <strong>Action:</strong> {manualResult.ai_mitigation_fix}
              </div>

              <Link
                to={`/dashboard/returns/${manualResult._id}`}
                className="inline-flex items-center gap-1 text-xs text-brand-400 hover:underline font-semibold pt-1"
              >
                View Full Diagnostic Page <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Demo Seed Tab */}
      {activeTab === 'demo' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">Load Full 4-Week Hackathon Seed Dataset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Populates your store with 50+ realistic multi-category return records, historical weekly trends, problem product leaderboards, and AI recommendations.
            </p>
          </div>

          <button
            onClick={handleLoadDemoDataset}
            disabled={uploading}
            className="px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
            {uploading ? 'Populating Database...' : 'Load Complete Pre-Configured Dataset'}
          </button>
        </div>
      )}
    </div>
  );
};
