import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

// DESIGN.md §18 — Products should feel like cases, not leaderboard tiles
// Structure: Product name → Return rate + recent movement → Dominant reason → Priority → Evidence

const movementVariant = (delta) => {
  if (delta > 2)  return 'attention';
  if (delta < -1) return 'success';
  return 'muted';
};

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
    <div className="space-y-8">
      <div>
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Problem SKU Profiles</h1>
        <p className="text-compact text-graphite">
          Products that have generated enough return signals to warrant investigation. Each is a case.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <p className="text-compact text-ash">Finding patterns…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayProducts.map((p, i) => (
            <ProductCase key={p.sku || i} rank={i + 1} product={p} />
          ))}
        </div>
      )}

      {/* Empty state per DESIGN.md §23 */}
      {!loading && displayProducts.length === 0 && (
        <div className="border border-stone rounded-card bg-surface px-6 py-10 text-center">
          <p className="text-compact font-semibold text-charcoal mb-1">No problem patterns yet</p>
          <p className="text-meta text-graphite mb-4">
            Import more return batches so ReturnShield can compare periods and surface recurring product issues.
          </p>
          <Link to="/dashboard/import" className="rs-btn-primary inline-flex" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
            Import returns
          </Link>
        </div>
      )}
    </div>
  );
};

const ProductCase = ({ rank, product: p }) => {
  const delta = p.week_delta ?? 2;
  const returnRate = p.return_rate ?? 0;

  return (
    <div className="border border-stone rounded-card bg-surface">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-mist">
        <div className="flex items-start gap-3 min-w-0">
          <span className="font-num text-meta text-ash w-5 flex-shrink-0 pt-0.5">{rank}</span>
          <div className="min-w-0">
            <p className="text-compact font-semibold text-charcoal">{p.product_name || p.name}</p>
            <p className="text-meta font-num text-ash">{p.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant={p.priority === 'High' ? 'attention' : p.priority === 'Medium' ? 'default' : 'muted'}>
            {p.priority || 'Medium'} priority
          </Badge>
          <Link
            to={`/dashboard/returns?product_id=${p.sku}`}
            className="rs-btn-quiet text-[13px]"
          >
            Investigate <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Case body */}
      <div className="grid sm:grid-cols-4 divide-x divide-mist">
        {/* Return rate */}
        <div className="px-4 py-3">
          <p className="text-meta text-ash mb-0.5">Return rate</p>
          <p className="font-num font-semibold text-charcoal" style={{ fontSize: 20 }}>{returnRate}%</p>
          <p className={`flex items-center gap-1 text-meta mt-0.5 ${movementVariant(delta) === 'attention' ? 'text-attention' : movementVariant(delta) === 'success' ? 'text-success' : 'text-ash'}`}>
            <TrendingUp className="w-3 h-3" />
            {delta > 0 ? `+${delta}pp` : `${delta}pp`} this week
          </p>
        </div>

        {/* Dominant reason */}
        <div className="px-4 py-3">
          <p className="text-meta text-ash mb-0.5">Dominant reason</p>
          <p className="text-compact font-semibold text-charcoal">{p.dominant_reason || p.top_reason || 'Fit / Sizing'}</p>
          <p className="text-meta text-graphite">{p.reason_pct || '41'}% of returns</p>
        </div>

        {/* Evidence count */}
        <div className="px-4 py-3">
          <p className="text-meta text-ash mb-0.5">Returns (14 days)</p>
          <p className="font-num font-semibold text-charcoal" style={{ fontSize: 20 }}>{p.recent_return_count || p.return_count || 0}</p>
          <p className="text-meta text-graphite">across {p.variant_count || 3} variants</p>
        </div>

        {/* Relevant evidence excerpt */}
        <div className="px-4 py-3">
          <p className="text-meta text-ash mb-1">Customer signal (sample)</p>
          <p className="text-meta text-charcoal italic leading-relaxed line-clamp-3">
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
    dominant_reason: 'Fit / Sizing',
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
    dominant_reason: 'Quality Defect',
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
    dominant_reason: 'Listing Mismatch',
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
    dominant_reason: 'Buyer Remorse',
    reason_pct: '33',
    recent_return_count: 6,
    variant_count: 2,
    priority: 'Low',
    sample_comment: 'Changed my mind after seeing it in person. The occasion passed.',
  },
];
