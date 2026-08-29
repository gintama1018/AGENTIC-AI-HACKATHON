import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { api } from '../../services/api';

// DESIGN.md §20 — Import should feel like adding evidence to the system
// Framing: "Bring return data in" not "AI is ingesting"
// Loading: "Receiving → Validating → Analyzing → Finding patterns → Ready"

const STAGES = ['Receiving', 'Validating', 'Analyzing', 'Finding patterns', 'Ready'];

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
      await sleep(600);
      setStage(1);

      const formData = new FormData();
      formData.append('file', file);

      await sleep(400);
      setStage(2);

      const res = await api.importReturns(formData);

      setStage(3);
      await sleep(700);
      setStage(4);
      await sleep(300);

      const d = res?.data || res;
      setCounts({
        total:    d?.total_records ?? d?.inserted ?? 0,
        valid:    d?.valid_records ?? d?.inserted ?? 0,
        warnings: d?.warnings ?? 0,
      });
      setWarnings(d?.warning_details || []);
      setStage('done');
    } catch (err) {
      setErrorMsg(err.message || 'Import could not be completed.');
      setStage('error');
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

  const isProcessing = typeof stage === 'number';


  return (
    <div className="max-w-xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Bring return data in</h1>
        <p className="text-compact text-graphite">
          Add a CSV or connect an existing source. ReturnShield will validate the records before analysis.
        </p>
      </div>

      {/* Upload area */}
      {(stage === null || stage === 'done' || stage === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={[
            'border-2 border-dashed rounded-card px-6 py-10 text-center cursor-pointer transition-colors',
            isDragOver
              ? 'border-charcoal bg-canvas'
              : 'border-stone bg-surface hover:border-charcoal',
          ].join(' ')}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-7 h-7 text-ash mx-auto mb-3" />
          <p className="text-compact font-semibold text-charcoal mb-1">
            {isDragOver ? 'Drop the file here' : 'Drop a CSV here, or click to browse'}
          </p>
          <p className="text-meta text-graphite">
            Accepted formats: .csv, .xlsx, .xls · Max 5,000 records per import
          </p>
        </div>
      )}

      {/* Processing pipeline — DESIGN.md §20 */}
      {typeof stage === 'number' && (
        <div className="border border-stone rounded-card bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-mist">
            <p className="text-compact font-semibold text-charcoal">Processing import</p>
            <p className="text-meta text-graphite">Your records are being validated and analyzed.</p>
          </div>
          <div className="divide-y divide-mist">
            {STAGES.map((label, i) => {
              const isActive    = stage === i;
              const isComplete  = typeof stage === 'number' && stage > i;
              return (
                <div key={label} className="flex items-center gap-3 px-5 py-3">
                  <div className={[
                    'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors',
                    isComplete ? 'bg-charcoal border-charcoal' : isActive ? 'border-charcoal' : 'border-stone',
                  ].join(' ')}>
                    {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-surface" />}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-charcoal animate-pulse" />}
                  </div>
                  <p className={`text-compact ${isActive ? 'text-charcoal font-semibold' : isComplete ? 'text-graphite line-through' : 'text-ash'}`}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Success state */}
      {stage === 'done' && counts && (
        <div className="space-y-4">
          <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <p className="text-compact font-semibold text-charcoal">Import complete</p>
              </div>
              <p className="text-meta text-graphite pl-6">{counts.valid} records ready for investigation.</p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-mist">
              {[
                { label: 'Received',      value: counts.total },
                { label: 'Ready',         value: counts.valid },
                { label: 'Need attention', value: counts.warnings },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3 text-center">
                  <p className="font-num font-semibold text-charcoal" style={{ fontSize: 22 }}>{value}</p>
                  <p className="text-meta text-graphite">{label}</p>
                </div>
              ))}
            </div>

            {warnings.length > 0 && (
              <div className="px-5 py-3">
                <p className="text-meta text-ash mb-2">Records needing attention</p>
                {warnings.slice(0, 3).map((w, i) => (
                  <p key={i} className="text-meta text-graphite">{w}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a href="/dashboard/returns" className="rs-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
              Review records <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button onClick={reset} className="rs-btn-secondary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
              Import another file
            </button>
          </div>
        </div>
      )}

      {/* Error state — DESIGN.md §26 */}
      {stage === 'error' && (
        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-attention" />
              <p className="text-compact font-semibold text-charcoal">Analysis could not be completed</p>
            </div>
            <p className="text-meta text-graphite pl-6">{errorMsg}</p>
            <p className="text-meta text-graphite pl-6 mt-1">Your file was received, but the analysis service did not respond. Your data was not lost.</p>
          </div>
          <div className="px-5 py-3 flex gap-3">
            <button onClick={reset} className="rs-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
              Retry import
            </button>
            <a href="/dashboard/returns" className="rs-btn-secondary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
              View saved records
            </a>
          </div>
        </div>
      )}

      {/* Expected CSV format */}
      <div className="border border-stone rounded-card bg-surface px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-ash" />
          <p className="text-compact font-semibold text-charcoal">Expected CSV format</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-meta text-graphite">
            <thead>
              <tr className="border-b border-mist">
                {['order_id', 'product_name', 'sku', 'customer_comment', 'return_date', 'order_value', 'city'].map((h) => (
                  <th key={h} className="pr-4 pb-2 text-left font-semibold text-charcoal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-4 pt-2 font-num">ORD-91823</td>
                <td className="pr-4 pt-2">Kurta Set Sage</td>
                <td className="pr-4 pt-2 font-num">BT-KRS-SG-M</td>
                <td className="pr-4 pt-2 italic">"Fits too small…"</td>
                <td className="pr-4 pt-2 font-num">2024-10-12</td>
                <td className="pr-4 pt-2 font-num">1890</td>
                <td className="pr-4 pt-2">Jaipur</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
