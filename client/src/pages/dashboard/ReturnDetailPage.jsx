import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck, MapPin, Truck, Calendar, IndianRupee } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const confidenceLabel = (s) => {
  const pct = Math.round((s ?? 0.75) * 100);
  if (s >= 0.85) return `High · ${pct}%`;
  if (s >= 0.65) return `Moderate · ${pct}%`;
  return `Low · ${pct}%`;
};

const statusVariant = (s = '') => {
  const v = s.toLowerCase();
  if (v === 'analyzed')    return 'success';
  if (v === 'pending')     return 'attention';
  if (v === 'processing')  return 'info';
  return 'muted';
};

export const ReturnDetailPage = () => {
  const { id } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.getReturnById(id)
      .then((res) => setData(res?.data || res))
      .catch((err) => setError(err.message || 'Failed to load return evidence'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="py-16 text-center text-slate-400">
      <p className="text-sm">Loading evidence dossier…</p>
    </div>
  );

  if (error || !data) return (
    <div className="py-16 text-center space-y-3">
      <p className="text-base font-bold text-white">Evidence record could not be loaded</p>
      <p className="text-xs text-slate-400">{error || 'Record not found.'}</p>
      <Link to="/dashboard/returns" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
        ← Return to Investigation Table
      </Link>
    </div>
  );

  const productName       = r.product_name || r.product || r.sku || 'Unspecified Product';
  const sku               = r.sku || r.product_id || 'UNKNOWN_SKU';
  const customerComment   = r.customer_comment || r.customer_feedback || r.original_reason || 'No customer comment recorded';
  const detectedReason    = r.detected_reason || r.ai_classification || r.ai_reason_category || 'General Return';
  const likelyCause       = r.ai_root_cause || r.root_cause || r.explanation || 'Root cause identified through cluster pattern analysis';
  const aiAction          = r.ai_recommendation || r.recommended_action || r.ai_mitigation_fix || 'Review return signals and monitor quality metrics';
  const confidence        = r.confidence_score ?? r.confidence ?? 0.85;
  const orderValue        = r.order_value ?? r.amount ?? null;
  const status            = r.status || 'Analyzed';
  const returnDate        = r.return_date || r.date || 'N/A';
  const city              = r.customer_city || r.city || 'Unknown Location';
  const logistic          = r.logistics_partner || r.courier || 'Unknown Courier';

  return (
    <div className="max-w-3xl space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <Link to="/dashboard/returns" className="rs-btn-secondary p-1.5" style={{ height: 28, width: 28 }}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <Link to="/dashboard/returns" className="text-slate-400 hover:text-slate-200">Returns Table</Link>
        <span className="text-slate-600">/</span>
        <span className="text-white font-bold">{id}</span>
      </div>

      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{productName}</h1>
            <p className="text-xs font-num text-slate-400 mt-0.5">SKU: {sku} · Case File: {id}</p>
          </div>
          <Badge variant={statusVariant(status)}>{status}</Badge>
        </div>

        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
          <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400" /> ₹{Number(orderValue).toLocaleString('en-IN')}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {city}</span>
          <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-slate-400" /> {logistic}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {returnDate}</span>
        </div>
      </div>

      {/* Evidence Sheet Dossier */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800">

        {/* 1. Customer voice */}
        <div className="p-6 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Verbatim Customer Voice (Evidence)</p>
          <blockquote className="text-sm text-slate-200 italic leading-relaxed border-l-2 border-indigo-500 pl-4 py-2 bg-slate-900/80 rounded-r-lg">
            "{customerComment}"
          </blockquote>
        </div>

        {/* 2. Detection */}
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detected Classification</p>
            <p className="text-sm font-bold text-white">{detectedReason}</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confidence Score</p>
            <Badge variant="success">{confidenceLabel(confidence)}</Badge>
          </div>
        </div>

        {/* 3. Inferred Root Cause */}
        <div className="p-6 space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>2. Inferred Operational Root Cause</span>
            <span className="text-[10px] text-slate-400 font-normal italic">(Analytic Diagnosis)</span>
          </p>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            {likelyCause}
          </p>
        </div>

        {/* 4. Action */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Recommended Operational Intervention</p>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            {aiAction}
          </p>
          <div className="pt-2 flex justify-end">
            <Link
              to="/dashboard/recommendations"
              className="rs-btn-primary text-xs"
            >
              Take Action in Action Hub <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
