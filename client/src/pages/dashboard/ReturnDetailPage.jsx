import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  User
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.getReturnById(id);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load return diagnostic');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading return diagnostic telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl max-w-lg mx-auto space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Diagnostic Record Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Could not find return with that ID.'}</p>
        <Link to="/dashboard/returns" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Returns Explorer
        </Link>
      </div>
    );
  }

  const { data: item, productStats, relatedReturns, recommendation } = data;

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Return Diagnostic: {item.order_id}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AI Analyzed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged on {new Date(item.return_date || item.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" /> View Recommended Action
          </Link>
        </div>
      </div>

      {/* Main Diagnostic 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Voice & AI Classification */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Customer Feedback & Return Request</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Customer: <span className="text-white">{item.customer_name || 'Verified Buyer'}</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Raw Feedback</p>
              <p className="text-sm text-slate-100 italic leading-relaxed">
                "{item.customer_comment || item.return_reason_raw}"
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-800">
                <span>Reason Tag: <strong className="text-slate-200">{item.return_reason_raw}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">AI Category</p>
                <Badge variant={item.ai_reason_category} className="mt-1">
                  {item.ai_reason_category}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">AI Confidence</p>
                <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
                  {Math.round((item.ai_confidence || 0.95) * 100)}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Defect Severity</p>
                <Badge variant={item.severity || 'high'} className="mt-1 capitalize">
                  {item.severity || 'high'} Priority
                </Badge>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" /> Diagnosed Engineering Root Cause
              </h3>
              <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/30">
                ReturnShield NLP Model
              </span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40">
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {item.ai_root_cause}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Corrective Action Prescribed:
              </p>
              <p className="text-xs text-slate-200 leading-relaxed">
                {item.ai_mitigation_fix}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Product Context & Related Recurring Returns */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-4 h-4 text-indigo-400" /> Affected Product Details
            </h3>

            <div>
              <p className="text-base font-extrabold text-white">{item.product_name}</p>
              <p className="text-xs font-mono text-slate-400 mt-0.5">SKU: {item.product_id} • Category: {item.category || 'Ethnic Wear'}</p>
            </div>

            {productStats ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">SKU Return Rate</p>
                  <p className="text-lg font-bold font-mono text-rose-400 mt-0.5">{productStats.return_rate}%</p>
                  <p className="text-[10px] text-slate-500">Benchmark ~14%</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Priority Score</p>
                  <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">{productStats.priority_score} / 100</p>
                  <p className="text-[10px] text-slate-500">Ranked #{1} Problem SKU</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Cumulative Loss</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    ₹{(productStats.estimated_financial_loss || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Across {productStats.total_returns} recorded returns</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/80 text-xs text-slate-400">
                Price: ₹{item.product_price?.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-brand-400" /> Recurring Returns for Same SKU
              </h3>
              <p className="text-xs text-slate-400">Cross-time historical returns proving persistent pattern</p>
            </div>

            <div className="space-y-2.5">
              {(relatedReturns || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No other returns recorded for this SKU yet.</p>
              ) : (
                relatedReturns.map((rel, idx) => (
                  <Link
                    key={idx}
                    to={`/dashboard/returns/${rel._id}`}
                    className="block p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-brand-500/40 transition-all text-xs group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-brand-400">{rel.order_id}</span>
                      <Badge variant={rel.ai_reason_category} size="sm">
                        {rel.ai_reason_category}
                      </Badge>
                    </div>
                    <p className="text-slate-400 italic line-clamp-1">"{rel.customer_comment}"</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
