import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Layers, 
  Cpu, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Calendar,
  Package,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const PatternsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        setLoading(true);
        const res = await api.getPatternAnalytics();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load pattern analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Synthesizing cross-time pattern trajectories...</p>
        </div>
      </div>
    );
  }

  const { weeklyTrendData, trajectory, rootCauseClusters } = data || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Cross-Time Pattern Intelligence</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Persistent DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking return driver trajectories across past 4 weeks of uploads to detect emerging quality defects.
          </p>
        </div>
      </div>

      {/* Trajectory Delta Cards (Rising vs Falling) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Reason Trajectory Radar (Week-over-Week Shift)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(trajectory || []).map((item, idx) => {
            const isRising = item.direction === 'rising';
            const isFalling = item.direction === 'falling';

            return (
              <div 
                key={idx} 
                className={`glass-card rounded-2xl p-4 border transition-all ${
                  isRising && item.percentageChange > 20 
                    ? 'border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-slate-900' 
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={item.category} size="sm">
                    {item.category}
                  </Badge>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                    isRising ? 'bg-rose-500/20 text-rose-400' :
                    isFalling ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isRising && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {isFalling && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {!isRising && !isFalling && <Minus className="w-3.5 h-3.5" />}
                    {item.percentageChange > 0 ? `+${item.percentageChange}%` : `${item.percentageChange}%`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Current Week</span>
                    <p className="text-lg font-extrabold text-white">{item.currentCount} returns</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Prior Week</span>
                    <p className="text-sm font-semibold text-slate-400">{item.priorCount} returns</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`font-semibold capitalize ${
                    isRising ? 'text-rose-400' : isFalling ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {item.direction === 'rising' ? '⚠️ Surging Driver' : item.direction === 'falling' ? '✅ Declining Driver' : 'Stable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Line Trend Chart */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" /> 4-Week Longitudinal Category Trajectory
            </h3>
            <p className="text-xs text-slate-400">Comparing return categories across historical weekly intervals</p>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrendData || []} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Size & Fit Mismatch" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Quality / Manufacturing Defect" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Listing & Color Variance" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Logistics & Transit Damage" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Warehouse Fulfillment Error" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Root-Cause Clusters */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-400" /> Root-Cause Clustering Breakdown
          </h3>
          <p className="text-xs text-slate-400">Identified recurring mechanical and catalog defects grouped by failure cluster</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(rootCauseClusters || []).map((cluster, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <Badge variant={cluster.category} size="sm">
                  {cluster.category}
                </Badge>
                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {cluster.count} occurrences
                </span>
              </div>

              <p className="text-xs text-slate-200 font-mono leading-relaxed font-semibold">
                {cluster.rootCause}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Affected SKUs: <strong className="text-slate-300">{cluster.affectedProductsCount} items</strong></span>
                <span className="truncate max-w-[180px] text-slate-500">
                  {cluster.affectedProducts.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
