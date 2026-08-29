import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

// DESIGN.md §16 — Detail page as evidence file / investigation dossier
// Linear, separator-divided. Evidence clearly separated from inference.
// §22 — Evidence vs Inference distinction is core to trust.

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
  if (v === 'processing')  return 'default';
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
    <div className="py-16 text-center">
      <p className="text-compact text-ash">Loading evidence dossier…</p>
    </div>
  );

  if (error || !data) return (
    <div className="py-16 text-center space-y-3">
      <p className="text-compact font-semibold text-charcoal">Evidence could not be loaded</p>
      <p className="text-meta text-graphite">{error || 'Record not found.'}</p>
      <Link to="/dashboard/returns" className="text-compact text-graphite hover:text-charcoal transition-colors">
        ← Return to investigation table
      </Link>
    </div>
  );

  // Normalise field names across db schema variants
  const r = data;
  const productName       = r.product_name || r.product || '—';
  const sku               = r.sku || r.product_id || '—';
  const customerComment   = r.customer_comment || r.customer_feedback || r.original_reason || '—';
  const detectedReason    = r.detected_reason || r.ai_classification || r.category || '—';
  const likelyCause       = r.ai_root_cause || r.root_cause || r.explanation || '—';
  const aiAction          = r.ai_recommendation || r.recommended_action || '—';
  const confidence        = r.confidence_score ?? r.confidence ?? 0.75;
  const orderValue        = r.order_value ?? r.amount ?? 0;
  const status            = r.status || 'Pending';
  const returnDate        = r.return_date || r.date;
  const city              = r.customer_city || r.city || '—';
  const logistic          = r.logistics_partner || r.courier || 'Delhivery';

  const relatedReturns    = r.related_returns || [];

  return (
    <div className="max-w-2xl space-y-0">

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Link to="/dashboard/returns" className="rs-btn-quiet p-1.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-compact text-graphite">Returns</span>
        <span className="text-graphite">/</span>
        <span className="text-compact text-charcoal font-medium">{id}</span>
      </div>

      {/* Context header */}
      <div className="pb-5 mb-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-[20px] font-semibold text-charcoal tracking-tight">{productName}</h1>
          <Badge variant={statusVariant(status)}>{status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-meta text-graphite">
          <span className="font-num">{sku}</span>
          <span>·</span>
          <span className="font-num">₹{Number(orderValue).toLocaleString('en-IN')}</span>
          <span>·</span>
          <span>{city}</span>
          <span>·</span>
          <span>{logistic}</span>
          {returnDate && <>
            <span>·</span>
            <span className="font-num">{new Date(returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </>}
        </div>
      </div>

      {/* ── DESIGN.md §16 — Evidence sheet, linear + separated ── */}
      <div className="border border-stone rounded-card overflow-hidden divide-y divide-mist bg-surface">

        {/* §22 — Evidence: what the system received */}
        <div className="px-5 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">Customer evidence</p>
          <blockquote
            className="text-body text-charcoal leading-relaxed border-l-2 border-stone pl-4"
            style={{ fontStyle: 'italic' }}
          >
            "{customerComment}"
          </blockquote>
        </div>

        {/* §22 — Detection: what the model classified */}
        <div className="px-5 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">Detection</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-meta text-graphite mb-1">Detected reason</p>
              <p className="text-compact font-semibold text-charcoal">{detectedReason}</p>
            </div>
            <div>
              <p className="text-meta text-graphite mb-1">Classification confidence</p>
              <p className="text-compact font-semibold text-charcoal">{confidenceLabel(confidence)}</p>
            </div>
          </div>
        </div>

        {/* §22 — Inference: clearly labelled as inferred, not confirmed */}
        <div className="px-5 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-1">
            Inference <span className="normal-case italic text-ash font-normal">(not a confirmed fact)</span>
          </p>
          <p className="text-meta text-graphite mb-3">
            What the system believes may be the underlying operational cause.
          </p>
          <p className="text-compact text-charcoal leading-relaxed">{likelyCause}</p>
        </div>

        {/* Related pattern */}
        {relatedReturns.length > 0 && (
          <div className="px-5 py-5">
            <p className="text-meta text-ash uppercase tracking-wider mb-2">Related pattern</p>
            <p className="text-compact text-charcoal mb-3">
              <span className="font-num font-semibold">{relatedReturns.length}</span> similar returns cite the same reason in recent weeks.
            </p>
            <div className="space-y-1">
              {relatedReturns.slice(0, 3).map((rel, i) => (
                <Link key={i} to={`/dashboard/returns/${rel.id}`} className="flex items-center gap-2 text-compact text-graphite hover:text-charcoal transition-colors py-0.5">
                  <span className="font-num text-meta">{rel.id}</span>
                  <span>—</span>
                  <span className="italic">"{(rel.customer_comment || '').slice(0, 60)}…"</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* §22 — Recommendation: what the user could do */}
        <div className="px-5 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-2">Recommended action</p>
          <p className="text-compact text-charcoal leading-relaxed mb-4">{aiAction}</p>
          <Link
            to="/dashboard/recommendations"
            className="rs-btn-primary inline-flex"
            style={{ height: 36, padding: '0 14px', fontSize: 13 }}
          >
            See in Actions →
          </Link>
        </div>
      </div>

      {/* Additional metadata */}
      <div className="pt-5 grid sm:grid-cols-2 gap-4 text-meta text-graphite border-t border-mist">
        {[
          { label: 'Return ID', value: id },
          { label: 'Category', value: r.category || detectedReason },
          { label: 'Customer city', value: city },
          { label: 'Logistics', value: logistic },
          { label: 'Order value', value: `₹${Number(orderValue).toLocaleString('en-IN')}`, mono: true },
          { label: 'Tenant', value: r.tenant_id || 'BharatThreads' },
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex items-baseline justify-between border-b border-mist pb-2">
            <span className="text-ash">{label}</span>
            <span className={`text-charcoal ${mono ? 'font-num' : ''}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
