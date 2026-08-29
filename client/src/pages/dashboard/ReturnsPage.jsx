import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Download, ChevronLeft, ChevronRight, ExternalLink, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

// DESIGN.md §12 — Tables feel like records, not spreadsheets
// §12.1 — Confidence as readable text ("High · 91%"), not decorative meter
// §13 — Status: text-first with tiny dot

const confidenceVariant = (score) => {
  if (score >= 0.85) return 'success';
  if (score >= 0.65) return 'default';
  return 'attention';
};
const confidenceLabel = (score) => {
  if (score >= 0.85) return `High · ${Math.round(score * 100)}%`;
  if (score >= 0.65) return `Moderate · ${Math.round(score * 100)}%`;
  return `Low · ${Math.round(score * 100)}%`;
};

const statusVariant = (s) => {
  if (!s) return 'muted';
  const v = s.toLowerCase();
  if (v === 'analyzed')     return 'success';
  if (v === 'pending')      return 'attention';
  if (v === 'needs review') return 'attention';
  if (v === 'processing')   return 'default';
  return 'muted';
};

const CATEGORIES = [
  'All',
  'Size & Fit Mismatch',
  'Quality / Manufacturing Defect',
  'Listing & Color Variance',
  'Logistics & Transit Damage',
  'Warehouse Fulfillment Error',
  'Buyer Remorse / Intent Shift',
];

export const ReturnsPage = () => {
  const [searchParams]  = useSearchParams();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState(searchParams.get('product_id') || '');
  const [category, setCategory] = useState('All');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected]     = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.getReturns({ search, category, page, limit: 15 });
      setReturns(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReturns(); }, [search, category, page]);

  const openQuickView = (r) => { setSelected(r); setModalOpen(true); };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Returns Investigation</h1>
        <p className="text-compact text-graphite">
          <span className="font-num font-semibold text-charcoal">{totalCount}</span> records — scan for patterns, open a dossier for full evidence.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ash" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search product, SKU, customer…"
            className="rs-field pl-9 w-64"
            style={{ height: 36, fontSize: 13 }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rs-field w-auto pr-8"
          style={{ height: 36, fontSize: 13 }}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={() => api.exportReturns?.().catch(console.error)}
          className="rs-btn-secondary flex-shrink-0"
          style={{ height: 36, padding: '0 12px', fontSize: 13 }}
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Table */}
      <div className="border border-stone rounded-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-stone">
              {['Product', 'Customer signal', 'Detected reason', 'Confidence', 'Date', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-meta text-graphite font-semibold bg-canvas"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-compact text-ash">
                  Checking records…
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <p className="text-compact text-graphite font-semibold mb-1">No returns match this filter</p>
                  <p className="text-meta text-ash">Adjust the search or category filter to see records.</p>
                </td>
              </tr>
            ) : returns.map((r, i) => (
              <tr
                key={r.id || i}
                className="border-b border-mist last:border-0 hover:bg-canvas cursor-pointer transition-colors"
                onClick={() => openQuickView(r)}
              >
                {/* Product */}
                <td className="px-4 py-3">
                  <p className="text-compact font-semibold text-charcoal">{r.product_name}</p>
                  <p className="text-meta font-num text-ash">{r.sku}</p>
                </td>

                {/* Customer signal — verbatim excerpt */}
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-compact text-graphite line-clamp-2 italic leading-snug">
                    "{(r.customer_comment || r.reason || '').slice(0, 90)}{(r.customer_comment || '').length > 90 ? '…' : ''}"
                  </p>
                </td>

                {/* Detected reason */}
                <td className="px-4 py-3">
                  <p className="text-compact text-charcoal">{r.detected_reason || r.category || '—'}</p>
                </td>

                {/* Confidence as readable text, NOT a decorative bar */}
                <td className="px-4 py-3">
                  <Badge variant={confidenceVariant(r.confidence_score ?? 0.75)}>
                    {confidenceLabel(r.confidence_score ?? 0.75)}
                  </Badge>
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  <span className="text-meta font-num text-graphite">
                    {r.return_date ? new Date(r.return_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(r.status)}>
                    {r.status || 'Pending'}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openQuickView(r)}
                      className="rs-btn-quiet p-1.5"
                      title="Quick view"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to={`/dashboard/returns/${r.id}`}
                      className="rs-btn-quiet p-1.5"
                      title="Full dossier"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-compact text-graphite">
          <span className="text-meta text-ash">
            Page <span className="font-num">{page}</span> of <span className="font-num">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rs-btn-quiet p-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rs-btn-quiet p-2 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Inspection Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Return — ${selected?.product_name || selected?.id || ''}`}>
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-meta text-ash mb-1">Customer signal</p>
              <blockquote className="text-compact text-charcoal italic border-l-2 border-stone pl-3 leading-relaxed">
                "{selected.customer_comment || selected.reason || 'No comment provided'}"
              </blockquote>
            </div>
            <div className="border-t border-mist pt-4 grid grid-cols-2 gap-3 text-compact">
              <div>
                <p className="text-meta text-ash mb-0.5">Detected reason</p>
                <p className="font-semibold text-charcoal">{selected.detected_reason || selected.category || '—'}</p>
              </div>
              <div>
                <p className="text-meta text-ash mb-0.5">Confidence</p>
                <p className="font-semibold text-charcoal">{confidenceLabel(selected.confidence_score ?? 0.75)}</p>
              </div>
              <div>
                <p className="text-meta text-ash mb-0.5">Amount</p>
                <p className="font-num font-semibold text-charcoal">₹{(selected.order_value || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-meta text-ash mb-0.5">Status</p>
                <Badge variant={statusVariant(selected.status)}>{selected.status || 'Pending'}</Badge>
              </div>
            </div>
            <div className="border-t border-mist pt-4 flex justify-end">
              <Link
                to={`/dashboard/returns/${selected.id}`}
                onClick={() => setModalOpen(false)}
                className="rs-btn-primary"
                style={{ height: 36, padding: '0 14px', fontSize: 13 }}
              >
                Open full dossier →
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
