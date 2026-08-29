import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCcw, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight, 
  PackageX, 
  Lightbulb, 
  UploadCloud, 
  CheckCircle2, 
  ChevronRight,
  RefreshCw,
  Eye,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { AlertBanner } from '../../components/ui/AlertBanner';

const COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6'];

export const OverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getOverviewAnalytics();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Aggregating cross-time returns telemetry...</p>
        </div>
      </div>
    );
  }

  const { metrics, reasonDistribution, volumeTimeline, topProblemProducts, recentReturns, urgentAlert } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if high return spike */}
      {urgentAlert && <AlertBanner alert={urgentAlert} />}

      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Returns Intelligence Overview</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-week return diagnostics, priority scores, and financial impact.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload CSV Returns
          </Link>
          <button
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 transition-all"
            title="Refresh analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Returns Tracked"
          value={metrics?.totalReturns || 0}
          icon={RotateCcw}
          trend="+12%"
          trendDirection="up"
          trendLabel="vs last month"
          iconColor="text-indigo-400"
          gradient="from-indigo-500/20 to-blue-500/10"
        />

        <StatCard
          title="Estimated RTO Rate"
          value={`${metrics?.rtoRate || 0}%`}
          icon={Percent}
          trend="-2.4%"
          trendDirection="down"
          trendLabel="target <18%"
          iconColor="text-emerald-400"
          gradient="from-emerald-500/20 to-teal-500/10"
        />

        <StatCard
          title="Financial Loss / At Risk"
          value={`$${(metrics?.totalFinancialLoss || 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle="Shipping + handling + markdown"
          iconColor="text-rose-400"
          gradient="from-rose-500/20 to-pink-500/10"
        />

        <StatCard
          title="AI Diagnostic Confidence"
          value={`${metrics?.avgConfidence || 94}%`}
          icon={Sparkles}
          badgeText="n8n NLP"
          subtitle="Autonomous root-cause accuracy"
          iconColor="text-amber-400"
          gradient="from-amber-500/20 to-yellow-500/10"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Area Chart: Daily Return Trend */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Return Ingestion & Defect Velocity (14-Day Timeline)
              </h3>
              <p className="text-xs text-slate-400">Tracking daily volume, sizing discrepancies, and hardware defects</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Total Returns
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sizing Mismatch
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hardware Defects
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorFit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDefect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="returns" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Returns" />
                <Area type="monotone" dataKey="fitIssues" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFit)" name="Size & Fit" />
                <Area type="monotone" dataKey="defects" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDefect)" name="Defects" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Donut Chart: AI Category Breakdown */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white">AI Reason Category Distribution</h3>
              <p className="text-xs text-slate-400">Classified by ReturnShield NLP Engine</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasonDistribution || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {(reasonDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '11px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 max-h-40 overflow-y-auto">
            {(reasonDistribution || []).slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-white ml-2">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Problem Products Leaderboard + Recent Analyzed Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Problem Products */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageX className="w-4 h-4 text-rose-400" /> Problem Products Priority
              </h3>
              <p className="text-xs text-slate-400">Ranked by Priority Score (Volume × Return Rate × Loss)</p>
            </div>
            <Link to="/dashboard/products" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(topProblemProducts || []).map((prod, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{prod.product_id}</span>
                    <span className="text-xs font-bold text-white truncate">{prod.product_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{prod.total_returns} returns</span>
                    <span>•</span>
                    <span className="text-rose-400 font-semibold">{prod.return_rate}% return rate</span>
                    <span>•</span>
                    <span className="text-slate-300 font-mono">${prod.estimated_financial_loss}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                    prod.priority_score >= 80 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                    prod.priority_score >= 60 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    Priority {prod.priority_score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Analyzed Returns */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" /> Recent AI-Analyzed Returns
              </h3>
              <p className="text-xs text-slate-400">Verbatim customer comments with diagnosed engineering root-causes</p>
            </div>
            <Link to="/dashboard/returns" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              Explorer Table <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {(recentReturns || []).map((ret, idx) => (
              <Link 
                key={idx} 
                to={`/dashboard/returns/${ret._id}`}
                className="block p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-850/80 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-brand-400">{ret.order_id}</span>
                    <span className="text-xs font-semibold text-slate-200">{ret.product_name}</span>
                    <Badge variant={ret.ai_reason_category} size="sm">
                      {ret.ai_reason_category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {Math.round((ret.ai_confidence || 0.94) * 100)}% conf
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic line-clamp-1">
                  "{ret.customer_comment || ret.return_reason_raw}"
                </p>
                <p className="text-[11px] text-slate-300 mt-1 font-mono flex items-center gap-1.5">
                  <span className="text-indigo-400 font-semibold">Root Cause:</span> {ret.ai_root_cause}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
