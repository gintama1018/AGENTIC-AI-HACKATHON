import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PackageX, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.getProductAnalytics();
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.top_reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Problem Product Leaderboard</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Priority Ranked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            SKUs ranked by dynamic Priority Score = (Return Rate × Return Volume × Net Financial Loss).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" /> View SKU Action Items
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, or primary failure cause..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 rounded-xl border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Rank & SKU</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Return Rate %</th>
                <th className="px-4 py-3">Total Returns</th>
                <th className="px-4 py-3">Cumulative Loss (INR)</th>
                <th className="px-4 py-3">Top AI Driver</th>
                <th className="px-4 py-3 text-right">Priority Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating SKU risk profiles...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No problem products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, idx) => (
                  <tr 
                    key={prod._id || idx}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setDetailModalOpen(true);
                    }}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                          idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          idx === 1 ? 'bg-slate-700 text-slate-200' :
                          idx === 2 ? 'bg-amber-900/30 text-amber-400' : 'text-slate-500'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-mono font-bold text-brand-400">{prod.product_id}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-white group-hover:text-brand-300 transition-colors">{prod.product_name}</p>
                      <p className="text-[10px] text-slate-500">MRP: ₹{prod.unit_price?.toLocaleString('en-IN') || '1,499'}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                        {prod.category || 'Apparel'}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-mono font-bold ${
                        prod.return_rate > 20 ? 'text-rose-400' :
                        prod.return_rate > 15 ? 'text-amber-400' : 'text-slate-300'
                      }`}>
                        {prod.return_rate}%
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300">
                      {prod.total_returns} units
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold text-rose-300">
                      ₹{(prod.estimated_financial_loss || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={prod.top_reason} size="sm">
                        {prod.top_reason}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-mono border ${
                        prod.priority_score >= 80 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        prod.priority_score >= 60 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {prod.priority_score} / 100
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drilldown Modal */}
      {selectedProduct && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Problem SKU Audit: ${selectedProduct.product_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Priority Score</p>
                <p className="text-xl font-extrabold text-rose-400 font-mono mt-0.5">{selectedProduct.priority_score}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Return Rate</p>
                <p className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">{selectedProduct.return_rate}%</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Cumulative Loss</p>
                <p className="text-xl font-extrabold text-white font-mono mt-0.5">₹{selectedProduct.estimated_financial_loss?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
              <p className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4" /> Primary Failure Mode:
              </p>
              <p className="text-slate-200">
                Top recurring driver is <strong className="text-white">{selectedProduct.top_reason}</strong>. This SKU contributes significantly to reverse courier and RTO loss.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4" /> AI Prescribed Action Plan:
              </p>
              <p className="text-slate-200 leading-relaxed">
                Update product size chart on catalog, calibrate vendor measurement tolerances, and audit QA inspection before next warehouse lot dispatch.
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                to={`/dashboard/returns?product_id=${selectedProduct.product_id}`}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
              >
                Filter Returns for this SKU <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
