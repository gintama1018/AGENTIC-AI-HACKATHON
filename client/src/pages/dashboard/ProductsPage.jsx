import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Package, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getProducts?.()
      .then((res) => setProducts(res?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Problem SKU Profiles</h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog products flagged with abnormal return concentration, financial drag, and persistent root causes.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Package className="w-6 h-6 animate-pulse mx-auto mb-2 text-indigo-400" />
          <p className="text-xs">Loading problem product profiles from active run…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <p className="text-sm font-semibold text-slate-300">No problem SKU clusters detected</p>
          <p className="text-xs text-slate-400">Import a returns batch to let the agent identify concentrated product anomalies.</p>
          <Link to="/dashboard/import" className="rs-btn-primary text-xs inline-block">Go to Import Page</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p, i) => (
            <ProductCase key={p.sku || i} rank={i + 1} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCase = ({ rank, product: p }) => {
  const delta = p.week_delta;
  const returnRate = p.return_rate;

  return (
    <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-800/80 bg-[#0D121F]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-num text-xs font-bold text-slate-500 w-5 flex-shrink-0">{rank}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{p.product_name || p.name || p.sku}</p>
            <p className="text-[11px] font-num text-slate-400">SKU: {p.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="font-num text-sm font-extrabold text-white">
              {returnRate !== null ? `${returnRate}%` : `${p.recent_return_count} returns`}
            </span>
            {delta !== null && (
              <span className={`text-[10px] flex items-center justify-end gap-0.5 font-num font-bold ${delta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                <TrendingUp className="w-2.5 h-2.5" /> {delta > 0 ? `+${delta}%` : `${delta}%`}
              </span>
            )}
          </div>
          <Badge variant={p.priority === 'High' ? 'attention' : 'muted'}>{p.priority || 'Medium'} Priority</Badge>
        </div>
      </div>

      {/* Detail row */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 text-xs">
        <div className="p-4 space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Dominant Reason</p>
          <p className="font-bold text-white">{p.dominant_reason || 'Return recorded'}</p>
          {p.reason_pct !== null && (
            <p className="text-slate-400 font-num">{p.reason_pct}% of product returns</p>
          )}
        </div>

        <div className="p-4 space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Analyzed Events</p>
          <p className="font-num font-bold text-white">{p.recent_return_count || 0} events</p>
          <p className="text-slate-400">{p.variant_count || 1} size variants evaluated</p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Sample Customer Feedback</p>
          <p className="text-slate-300 italic line-clamp-2">"{p.sample_comment || 'No comment provided'}"</p>
        </div>
      </div>
    </div>
  );
};
