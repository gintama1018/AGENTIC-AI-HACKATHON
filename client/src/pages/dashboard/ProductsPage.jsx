import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getProducts?.()
      .then((res) => setProducts(res?.data || []))
      .catch(() => setProducts(FALLBACK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;

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
          <p className="text-xs">Loading problem product profiles…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayProducts.map((p, i) => (
            <ProductCase key={p.sku || i} rank={i + 1} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCase = ({ rank, product: p }) => {
  const delta = p.week_delta ?? 2.8;
  const returnRate = p.return_rate ?? 18.4;

  return (
    <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-800/80 bg-[#0D121F]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-num text-xs font-bold text-slate-500 w-5 flex-shrink-0">{rank}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{p.product_name || p.name}</p>
            <p className="text-[11px] font-num text-slate-400">{p.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant={p.priority === 'High' ? 'critical' : 'attention'}>
            {p.priority || 'High'} Priority
          </Badge>
          <Link
            to={`/dashboard/returns?product_id=${p.sku}`}
            className="rs-btn-secondary text-xs"
            style={{ height: 30, padding: '0 10px' }}
          >
            Investigate <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Case body */}
      <div className="grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80 p-5 gap-4 sm:gap-0">
        {/* Return rate */}
        <div className="sm:pr-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Return Rate</p>
          <p className="font-num text-2xl font-extrabold text-white">{returnRate}%</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-amber-400">
            <TrendingUp className="w-3 h-3" />
            +{delta} pp this week
          </p>
        </div>

        {/* Dominant reason */}
        <div className="sm:px-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dominant Reason</p>
          <p className="text-sm font-bold text-white">{p.dominant_reason || 'Size & Fit Mismatch'}</p>
          <p className="text-xs text-slate-400">{p.reason_pct || '41'}% of all returns for SKU</p>
        </div>

        {/* Evidence count */}
        <div className="sm:px-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returns (14-Day)</p>
          <p className="font-num text-2xl font-extrabold text-amber-400">{p.recent_return_count || 17}</p>
          <p className="text-xs text-slate-400">across {p.variant_count || 3} sizing variants</p>
        </div>

        {/* Customer statement */}
        <div className="sm:pl-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sample Customer Voice</p>
          <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            "{p.sample_comment || 'I ordered medium like always but it fits like a small. The chest area is too tight.'}"
          </p>
        </div>
      </div>
    </div>
  );
};

const FALLBACK_PRODUCTS = [
  {
    product_name: 'Kurta Set — Sage Green',
    sku: 'BT-KRS-SG-M',
    return_rate: 18.4,
    week_delta: 4.2,
    dominant_reason: 'Size & Fit Mismatch',
    reason_pct: '41',
    recent_return_count: 17,
    variant_count: 3,
    priority: 'High',
    sample_comment: 'I ordered medium like always but it fits like a small. The chest area is too tight.',
  },
  {
    product_name: 'Embroidered Dupatta — Rust',
    sku: 'BT-DPT-RS-OS',
    return_rate: 14.1,
    week_delta: 3.1,
    dominant_reason: 'Quality / Manufacturing Defect',
    reason_pct: '68',
    recent_return_count: 11,
    variant_count: 1,
    priority: 'High',
    sample_comment: 'The dupatta has a loose thread and two small holes near the border embroidery.',
  },
  {
    product_name: "Men's Chino — Dark Teal",
    sku: 'BT-CHN-DT-32',
    return_rate: 11.2,
    week_delta: 1.8,
    dominant_reason: 'Listing & Color Variance',
    reason_pct: '55',
    recent_return_count: 9,
    variant_count: 4,
    priority: 'Medium',
    sample_comment: 'The color in the photo looked much darker. What arrived looks washed out.',
  },
  {
    product_name: 'Anarkali Suit — Ivory',
    sku: 'BT-ANK-IV-L',
    return_rate: 9.6,
    week_delta: 0.9,
    dominant_reason: 'Buyer Remorse / Intent Shift',
    reason_pct: '33',
    recent_return_count: 6,
    variant_count: 2,
    priority: 'Medium',
    sample_comment: 'Changed my mind after seeing it in person. The occasion passed.',
  },
];
