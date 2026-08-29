import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0B0F17] border border-slate-700 rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="text-slate-400 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white font-num flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}:</span>
          <strong>{p.value} returns</strong>
        </p>
      ))}
    </div>
  );
};

const FALLBACK_WEEKLY = [
  { week: 'Week 1', fit: 4,  quality: 2, listing: 1, logistics: 1 },
  { week: 'Week 2', fit: 6,  quality: 3, listing: 2, logistics: 2 },
  { week: 'Week 3', fit: 8,  quality: 4, listing: 2, logistics: 1 },
  { week: 'Week 4', fit: 11, quality: 5, listing: 3, logistics: 3 },
  { week: 'Week 5', fit: 17, quality: 6, listing: 4, logistics: 2 },
  { week: 'Week 6', fit: 14, quality: 7, listing: 5, logistics: 4 },
];

const SHIFT_DATA = [
  { reason: 'Fit / Sizing',   prev: 11, curr: 17 },
  { reason: 'Quality Defect', prev: 5,  curr: 7  },
  { reason: 'Listing Mismatch', prev: 3, curr: 5 },
  { reason: 'Logistics',      prev: 2,  curr: 4  },
  { reason: 'Buyer Remorse',  prev: 4,  curr: 3  },
];

export const PatternsPage = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatternAnalytics()
      .then((res) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = data?.weekly_trends?.length ? data.weekly_trends : FALLBACK_WEEKLY;

  if (loading) return (
    <div className="flex items-center justify-center h-56 text-slate-400 gap-2">
      <Activity className="w-5 h-5 animate-spin text-indigo-400" />
      <span className="text-sm font-medium">Analyzing return trajectory patterns…</span>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Longitudinal Return Patterns</h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical trajectories and week-over-week root-cause shifts across Indian operations.
        </p>
      </div>

      {/* ── Chart 1: Trajectory Trend ─────────────── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">1. Longitudinal Category Trajectory (Last 6 Weeks)</h2>
          <p className="text-xs text-slate-400">
            <strong className="text-amber-400">Size & Fit Mismatch</strong> accelerated from 4 to 17 returns per week, representing the steepest upward slope.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DarkTooltip />} />
              <Line
                dataKey="fit"
                name="Size & Fit"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="quality"
                name="Quality Defect"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ fill: '#F43F5E', r: 3 }}
              />
              <Line
                dataKey="listing"
                name="Listing Mismatch"
                stroke="#818CF8"
                strokeWidth={2}
                dot={{ fill: '#818CF8', r: 3 }}
              />
              <Line
                dataKey="logistics"
                name="Logistics Damage"
                stroke="#34D399"
                strokeWidth={2}
                dot={{ fill: '#34D399', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-800/80 flex-wrap text-xs">
            <span className="flex items-center gap-2 text-slate-300 font-semibold">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Size & Fit (Dominant Surge)
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Quality Defect
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-indigo-400" /> Listing Variance
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-emerald-400" /> Logistics Damage
            </span>
          </div>
        </div>
      </section>

      {/* ── Chart 2: Shift by reason ─────────── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">2. Week-over-Week Return Shift Analysis</h2>
          <p className="text-xs text-slate-400">
            Comparison between previous week (slate) and current week (indigo).
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SHIFT_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="reason"
                width={140}
                tick={{ fill: '#E2E8F0', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="prev" name="Last week" fill="#334155" radius={[0, 4, 4, 0]} barSize={10} />
              <Bar dataKey="curr" name="This week" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-2 rounded bg-slate-700" /> Previous Week Baseline
            </span>
            <span className="flex items-center gap-2 text-indigo-300 font-semibold">
              <span className="w-3 h-2 rounded bg-indigo-500" /> Current Week Surge
            </span>
          </div>
        </div>
      </section>

      {/* ── Editorial conclusions ──────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Operational Diagnoses & Root-Cause Summaries</h2>
        <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
          {[
            {
              signal: 'Size & Fit Mismatch',
              trend: 'up',
              conclusion: 'Continuous week-over-week acceleration. Strong correlation with Kurta Set batch #2024-Q3.',
              action: '/dashboard/products',
              actionLabel: 'Inspect Problem SKUs',
            },
            {
              signal: 'Quality / Defect',
              trend: 'up',
              conclusion: 'Concentrated in Embroidered Dupatta Rust SKU. Embroidery finishing flaws identified.',
              action: '/dashboard/returns?category=Quality',
              actionLabel: 'Filter Records',
            },
            {
              signal: 'Listing Variance',
              trend: 'up',
              conclusion: 'Studio lighting over-saturation on Men’s Chinos driving buyer disappointment.',
              action: '/dashboard/recommendations',
              actionLabel: 'View Action',
            },
          ].map(({ signal, trend, conclusion, action, actionLabel }) => (
            <div key={signal} className="flex items-start justify-between gap-4 p-5 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{signal}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{conclusion}</p>
                </div>
              </div>
              <Link to={action} className="rs-btn-secondary text-xs flex-shrink-0" style={{ height: 32, padding: '0 12px' }}>
                {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
