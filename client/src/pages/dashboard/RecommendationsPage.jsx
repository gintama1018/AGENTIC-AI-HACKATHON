import React, { useEffect, useState } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Plus, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  ArrowRight,
  TrendingDown,
  Filter,
  Search
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRecText, setNewRecText] = useState('');
  const [newRecPriority, setNewRecPriority] = useState('High');
  const [newRecSavings, setNewRecSavings] = useState(15000);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations({
        status: statusFilter,
        priority: priorityFilter,
        search
      });
      setRecommendations(res.data || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [statusFilter, priorityFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateRecommendationStatus(id, newStatus);
      setRecommendations(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      fetchRecs();
    } catch (err) {
      console.error('Failed to update recommendation status:', err);
    }
  };

  const handleCreateRecommendation = async (e) => {
    e.preventDefault();
    if (!newRecText) return;
    try {
      await api.createRecommendation({
        text: newRecText,
        priority: newRecPriority,
        estimated_savings: newRecSavings,
        category: 'Operations Initiative'
      });
      setNewRecText('');
      setCreateModalOpen(false);
      fetchRecs();
    } catch (err) {
      console.error('Failed to create recommendation:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Action Hub & Recommendations</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Closed-Loop Tracking
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prescriptive corrective actions to eliminate the engineering and catalog root-causes of returns in India.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Log Custom Initiative
          </button>
        </div>
      </div>

      {/* Summary KPI Bar in ₹ INR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Action Items</p>
          <p className="text-2xl font-extrabold text-white mt-1">{summary?.total || 0}</p>
          <p className="text-[10px] text-slate-500">{summary?.todo || 0} to do • {summary?.in_progress || 0} in progress</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Implemented Actions</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{summary?.done || 0}</p>
          <p className="text-[10px] text-slate-500">Verified return reductions</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Potential Savings</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">₹{(summary?.potentialSavings || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">Upon full implementation</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Realized Profit Protected</p>
          <p className="text-2xl font-extrabold text-gradient-emerald mt-1">₹{(summary?.realizedSavings || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">From completed actions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'todo', 'in_progress', 'done'].map((status) => {
            const labels = {
              'All': 'All Actions',
              'todo': 'To Do',
              'in_progress': 'In Progress',
              'done': 'Resolved / Done'
            };
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-900/90 rounded-xl border border-slate-700/80 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="All">Priority: All</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 glass-card rounded-2xl">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading AI recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 glass-card rounded-2xl">
            <p className="text-xs">No recommendations found matching current filter.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const isDone = rec.status === 'done';
            const isInProgress = rec.status === 'in_progress';
            const isTodo = rec.status === 'todo';

            return (
              <div
                key={rec._id}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  isDone 
                    ? 'border-emerald-500/30 bg-emerald-950/10' 
                    : rec.priority === 'Critical' 
                    ? 'border-rose-500/30 bg-slate-900/90' 
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant={rec.priority} size="sm">
                        {rec.priority} Priority
                      </Badge>
                      <Badge variant={rec.category} size="sm">
                        {rec.category}
                      </Badge>
                      {rec.product_name && (
                        <span className="text-xs font-semibold text-slate-300">
                          SKU: <span className="text-white">{rec.product_name}</span>
                        </span>
                      )}
                    </div>

                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                      isDone ? 'text-slate-300 line-through' : 'text-white'
                    }`}>
                      {rec.text}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                        ₹ Est. Savings: ₹{(rec.estimated_savings || 4500).toLocaleString('en-IN')}
                      </span>
                      <span>•</span>
                      <span>Created {new Date(rec.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleStatusChange(rec._id, 'todo')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isTodo 
                          ? 'bg-slate-700 text-white border border-slate-600' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      To Do
                    </button>

                    <button
                      onClick={() => handleStatusChange(rec._id, 'in_progress')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isInProgress 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => handleStatusChange(rec._id, 'done')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDone 
                          ? 'bg-emerald-600 text-white shadow-glow-emerald' 
                          : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Resolved
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Initiative Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Log Operations Initiative"
      >
        <form onSubmit={handleCreateRecommendation} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Corrective Action Description</label>
            <textarea
              rows={3}
              required
              value={newRecText}
              onChange={(e) => setNewRecText(e.target.value)}
              placeholder="e.g. Enforce pre-shipment barcode scan validation at Bhiwandi warehouse..."
              className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
              <select
                value={newRecPriority}
                onChange={(e) => setNewRecPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Monthly Savings (₹ INR)</label>
              <input
                type="number"
                value={newRecSavings}
                onChange={(e) => setNewRecSavings(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-glow"
            >
              Add Action Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
