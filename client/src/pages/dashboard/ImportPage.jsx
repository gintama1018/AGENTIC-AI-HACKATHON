import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, ArrowRight, FileText, RefreshCw, Download, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

const STAGES = [
  'Receiving & Parsing records',
  'Resolving Indian courier & SKU aliases',
  'Dispatching to Workflow 1 (/returns-agent)',
  'Gemini reason synthesis & self-verification',
  'Persisting Run State & Analytics'
];

export const ImportPage = () => {
  const [stage, setStage]         = useState(null);
  const [counts, setCounts]       = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [warnings, setWarnings]   = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setStage(0);
    setErrorMsg('');
    setWarnings([]);
    setCounts(null);

    try {
      await sleep(400);
      setStage(1);

      const formData = new FormData();
      formData.append('file', file);

      await sleep(400);
      setStage(2);

      const res = await api.importReturns(formData);

      setStage(3);
      await sleep(600);
      setStage(4);
      await sleep(400);

      const d = res?.data || res;
      setCounts({
        total:    res?.total_records ?? d?.total_records ?? d?.returns?.length ?? 0,
        valid:    res?.valid_records ?? d?.valid_records ?? d?.returns?.length ?? 0,
        run_id:   res?.run_id || d?.run?.id || 'rs_live',
        source:   d?.intelligence_source || res?.intelligence_source || 'n8n'
      });
      setStage('done');
    } catch (err) {
      setErrorMsg(err.message || 'Import could not be completed.');
      setStage('error');
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample_returns_india.csv');
      const blob = await response.blob();
      const file = new File([blob], 'sample_returns_india.csv', { type: 'text/csv' });
      processFile(file);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setStage(null);
    setCounts(null);
    setErrorMsg('');
    setWarnings([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Import Return Data</h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload return batches from Shopify, Unicommerce, Delhivery, or ERP spreadsheets for Workflow 1 ingestion.
          </p>
        </div>

        {/* 1-Click Sample Load Action */}
        <button
          onClick={handleLoadSample}
          disabled={typeof stage === 'number'}
          className="rs-btn-primary text-xs flex items-center gap-1.5 shrink-0"
          style={{ height: 36, padding: '0 14px' }}
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          ⚡ Load Sample Indian Batch
        </button>
      </div>

      {/* Upload area */}
      {(stage === null || stage === 'done' || stage === 'error') && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              'border-2 border-dashed rounded-xl px-6 py-12 text-center cursor-pointer transition-all',
              isDragOver
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-slate-800 bg-[#111827] hover:border-slate-600 hover:bg-slate-800/40',
            ].join(' ')}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              {isDragOver ? 'Drop CSV file here' : 'Click to select CSV file, or drag and drop here'}
            </p>
            <p className="text-xs text-slate-400">
              Supports Indian D2C export formats (.csv, .xlsx) · Up to 5,000 orders per batch
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Need a test file?</span>
            <a
              href="/sample_returns_india.csv"
              download="sample_returns_india.csv"
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
            </a>
          </div>
        </div>
      )}

      {/* Processing Pipeline */}
      {typeof stage === 'number' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              Workflow 1 Analysis Pipeline Active
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Records are being processed through deterministic analytics & Gemini reasoning.</p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {STAGES.map((label, i) => {
              const isActive   = stage === i;
              const isComplete = typeof stage === 'number' && stage > i;
              return (
                <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={[
                    'w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold',
                    isComplete ? 'bg-emerald-600 border-emerald-500 text-white' : isActive ? 'border-indigo-500 text-indigo-400' : 'border-slate-800 text-slate-600',
                  ].join(' ')}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : (i + 1)}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white font-bold' : isComplete ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done State */}
      {stage === 'done' && counts && (
        <div className="bg-[#111827] border border-emerald-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Analysis & Classification Complete</h3>
              <p className="text-xs text-slate-300 font-num">
                {counts.valid} records analyzed · Run ID: <strong className="text-emerald-300">{counts.run_id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a href="/dashboard" className="rs-btn-primary text-xs">
              View Operational Briefing <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a href="/dashboard/returns" className="rs-btn-secondary text-xs">
              Inspect Returns Table
            </a>
            <button onClick={reset} className="rs-btn-secondary text-xs">
              Import Another Batch
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {stage === 'error' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Import Pipeline Notice</span>
          </div>
          <p>{errorMsg}</p>
          <button onClick={reset} className="rs-btn-secondary text-xs mt-2">Try Again</button>
        </div>
      )}

      {/* Sample Reference */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Expected Columns Format</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-2 text-left">order_id</th>
                <th className="pb-2 text-left">product_name</th>
                <th className="pb-2 text-left">sku</th>
                <th className="pb-2 text-left">customer_comment</th>
                <th className="pb-2 text-left">city / pin</th>
                <th className="pb-2 text-left">order_value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pt-2 font-num">ORD-91823</td>
                <td className="pt-2">Kurta Set Sage</td>
                <td className="pt-2 font-num text-slate-400">BT-KRS-SG-M</td>
                <td className="pt-2 italic text-slate-400">"Fits too small on chest"</td>
                <td className="pt-2">PIN 305001</td>
                <td className="pt-2 font-num text-emerald-400">₹1,890</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
