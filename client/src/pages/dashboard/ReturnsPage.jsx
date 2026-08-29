import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Download, ChevronLeft, ChevronRight, ExternalLink, Eye, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const confidenceVariant = (score) => {
  if (score >= 0.85) return 'success';
  if (score >= 0.65) return 'default';
  return 'attention';
};

const confidenceLabel = (score) => {
  const pct = Math.round((score ?? 0.75) * 100);
  if (score >= 0.85) return `High · ${pct}%`;
  if (score >= 0.65) return `Moderate · ${pct}%`;
  return `Low · ${pct}%`;
};

const statusVariant = (s) => {
  if (!s) return 'muted';
  const v = s.toLowerCase();
  if (v === 'analyzed')     return 'success';
  if (v === 'pending')      return 'attention';
  if (v === 'needs review') return 'attention';
  if (v === 'processing')   return 'info';
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
      const res = await api.getReturns({ search, category, page, limit: 12 });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Returns Investigation Table</h1>
          <p className="text-xs text-slate-400 mt-1">
            <span className="font-num font-bold text-indigo-400">{totalCount} total records</span> · Scan for recurring signals, click to inspect evidence dossier.
          </p>
        </div>

        <button
          onClick={() => api.exportReturns()}
          className="rs-btn-secondary self-start sm:self-auto text-xs"
        >
          <Download className="w-3.5 h-3.5" /> Export All (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search product, SKU, customer..."
            className="rs-field pl-9"
          />
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rs-field w-auto min-w-[200px]"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#111827] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0D121F]">
                <th className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Product & SKU</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Customer Signal</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Detected Reason</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Confidence</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>Loading return records…</span>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-sm font-semibold text-white mb-1">No returns match this filter</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or category filter.</p>
                  </td>
                </tr>
              ) : returns.map((r, i) => (
                <tr
                  key={r.id || i}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => openQuickView(r)}
                >
                  {/* Product */}
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-bold text-white leading-snug">{r.product_name || 'Item'}</p>
                    <p className="text-[11px] font-num text-slate-400">{r.sku || 'SKU-N/A'}</p>
                  </td>

                  {/* Customer signal */}
                  <td className="px-5 py-3.5 max-w-sm">
                    <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
                      "{(r.customer_comment || r.reason || 'No details provided').slice(0, 95)}…"
                    </p>
                  </td>

                  {/* Detected reason */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-slate-200">{r.detected_reason || r.category || 'General'}</span>
                  </td>

                  {/* Confidence */}
                  <td className="px-5 py-3.5">
                    <Badge variant={confidenceVariant(r.confidence_score ?? 0.8)}>
                      {confidenceLabel(r.confidence_score ?? 0.8)}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-num text-slate-400">
                      {r.return_date ? new Date(r.return_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recent'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <Badge variant={statusVariant(r.status)}>
                      {r.status || 'Pending'}
                    </Badge>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openQuickView(r)}
                        className="rs-btn-quiet p-1.5"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                      </button>
                      <Link
                        to={`/dashboard/returns/${r.id}`}
                        className="rs-btn-quiet p-1.5"
                        title="Full Evidence Dossier"
                      >
                        <ExternalLink className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Page <strong className="text-white font-num">{page}</strong> of <strong className="text-white font-num">{totalPages}</strong></span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rs-btn-secondary text-xs disabled:opacity-40"
              style={{ height: 32, padding: '0 10px' }}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rs-btn-secondary text-xs disabled:opacity-40"
              style={{ height: 32, padding: '0 10px' }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Inspection Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Return Evidence — ${selected?.product_name || selected?.id || ''}`}>
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Customer Statement</p>
              <blockquote className="text-sm text-slate-200 italic leading-relaxed">
                "{selected.customer_comment || selected.reason || 'No customer comments'}"
              </blockquote>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 mb-0.5">Detected Classification</p>
                <p className="font-bold text-white">{selected.detected_reason || selected.category || 'General'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 mb-0.5">Confidence Rating</p>
                <Badge variant="success">{confidenceLabel(selected.confidence_score ?? 0.85)}</Badge>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 mb-0.5">Order Value</p>
                <p className="font-bold font-num text-white">₹{(selected.order_value || 1490).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 mb-0.5">Reverse Courier</p>
                <p className="font-bold text-white">{selected.logistics_partner || 'Delhivery'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Link
                to={`/dashboard/returns/${selected.id}`}
                onClick={() => setModalOpen(false)}
                className="rs-btn-primary"
              >
                Open Full Evidence Dossier <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
