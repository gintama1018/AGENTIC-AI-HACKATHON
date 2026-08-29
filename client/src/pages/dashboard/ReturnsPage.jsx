import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  SlidersHorizontal,
  ArrowUpDown,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('return_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const categories = [
    'All',
    'Size & Fit Mismatch',
    'Quality / Manufacturing Defect',
    'Listing & Color Variance',
    'Logistics & Transit Damage',
    'Warehouse Fulfillment Error',
    'Buyer Remorse / Intent Shift'
  ];

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.getReturns({
        search,
        category,
        severity,
        page,
        limit: 12,
        sortBy,
        sortOrder
      });
      setReturns(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [category, severity, page, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReturns();
  };

  const exportCsv = () => {
    if (returns.length === 0) return;
    const headers = ['Order ID', 'Customer', 'Product ID', 'Product Name', 'Price', 'AI Category', 'Confidence', 'Root Cause', 'Customer Comment', 'Date'];
    const rows = returns.map(r => [
      r.order_id,
      `"${r.customer_name || 'Customer'}"`,
      r.product_id,
      `"${r.product_name}"`,
      r.product_price,
      `"${r.ai_reason_category}"`,
      r.ai_confidence,
      `"${(r.ai_root_cause || '').replace(/"/g, '""')}"`,
      `"${(r.customer_comment || '').replace(/"/g, '""')}"`,
      r.return_date || r.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ReturnShield_Returns_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Returns Diagnostic Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect AI-classified returns with persistent root-cause tracing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export Filtered CSV
          </button>
          <Link
            to="/dashboard/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Ingest Returns
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, customer comment, product, or root cause keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 rounded-xl border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-900/90 rounded-xl border border-slate-700/80 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>Category: {c}</option>
              ))}
            </select>

            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-900/90 rounded-xl border border-slate-700/80 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="All">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
            >
              Apply Filter
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing <span className="text-white font-semibold">{returns.length}</span> of <span className="text-white font-semibold">{totalCount}</span> analyzed returns</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="flex items-center gap-1 hover:text-white"
            >
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort: {sortBy} ({sortOrder.toUpperCase()})
            </button>
          </div>
        </div>
      </div>

      {/* Returns Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Product & SKU</th>
                <th className="px-4 py-3">Customer Voice</th>
                <th className="px-4 py-3">AI Classified Category</th>
                <th className="px-4 py-3">Root Cause Diagnosis</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading return diagnostics...</span>
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No return records match your query filter.
                  </td>
                </tr>
              ) : (
                returns.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-brand-400">{item.order_id}</span>
                      <p className="text-[10px] text-slate-500">{new Date(item.return_date || item.created_at).toLocaleDateString()}</p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-white truncate max-w-[170px]">{item.product_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.product_id} • ${item.product_price || '49.99'}</p>
                    </td>

                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-slate-300 italic line-clamp-2">
                        "{item.customer_comment || item.return_reason_raw}"
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={item.ai_reason_category} size="sm">
                        {item.ai_reason_category}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="text-slate-200 line-clamp-2 font-mono text-[11px]">
                        {item.ai_root_cause}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {Math.round((item.ai_confidence || 0.94) * 100)}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReturn(item);
                          setInspectModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Quick View Diagnostics"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/dashboard/returns/${item._id}`}
                        className="p-1.5 inline-block text-brand-400 hover:text-brand-300 rounded-lg hover:bg-brand-500/10 transition-colors"
                        title="Full Diagnostic Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Page <span className="text-white font-semibold">{page}</span> of <span className="text-white font-semibold">{totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedReturn && (
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Diagnostic: ${selectedReturn.order_id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Product</p>
                <p className="font-bold text-white text-sm">{selectedReturn.product_name}</p>
                <p className="font-mono text-slate-400 text-[11px]">{selectedReturn.product_id} • ${selectedReturn.product_price}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">AI Category & Severity</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedReturn.ai_reason_category}>
                    {selectedReturn.ai_reason_category}
                  </Badge>
                  <Badge variant={selectedReturn.severity || 'medium'}>
                    {selectedReturn.severity || 'medium'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="text-slate-400 font-semibold">Raw Customer Voice Comment:</p>
              <p className="text-slate-200 italic leading-relaxed">
                "{selectedReturn.customer_comment || selectedReturn.return_reason_raw}"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
              <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Diagnosed Engineering Root Cause:
              </p>
              <p className="text-slate-200 font-mono leading-relaxed">
                {selectedReturn.ai_root_cause}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Recommended Mitigation Action:
              </p>
              <p className="text-slate-200 leading-relaxed">
                {selectedReturn.ai_mitigation_fix}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
              <Link
                to={`/dashboard/returns/${selectedReturn._id}`}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 flex items-center gap-1.5 shadow-glow"
              >
                Full Deep-Dive Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
