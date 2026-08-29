import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

// DESIGN.md §17 — Charts earn their place. Each chart answers ONE question.
// Every chart must have: Title + one-sentence interpretation above it.
// Neutral palette. Thin lines. No gradients. No rainbow series.

// Recharts custom tooltip matching the warm palette
const WarmTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-stone rounded-surface px-3 py-2 shadow-float text-meta">
      <p className="text-ash mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-charcoal font-num">
          {p.name}: <strong>{p.value}</strong>
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

  const weeklyData = data?.weekly_trends || FALLBACK_WEEKLY;

  if (loading) return (
    <div className="py-16 text-center">
      <p className="text-compact text-ash">Comparing previous history…</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Longitudinal Patterns</h1>
        <p className="text-compact text-graphite">
          How return reasons are changing over time. Each chart answers one specific question.
        </p>
      </div>

      {/* ── Chart 1: What changed week over week? ─────────────── */}
      <section>
        {/* DESIGN.md §17 — Chart header: title + one-sentence interpretation */}
        <div className="mb-5">
          <h2 className="text-subsection text-charcoal mb-1">Fit-related returns are accelerating</h2>
          <p className="text-compact text-graphite">
            Return volume for size and fit complaints has grown steadily over 6 weeks, while other categories remain roughly stable.
          </p>
        </div>

        <div className="border border-stone rounded-card bg-surface px-5 py-5">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#E8E3DB" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: '#8A847A', fontSize: 12 }}
                axisLine={{ stroke: '#D8D2C8' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8A847A', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<WarmTooltip />} />
              {/* Single dominant line; others are muted */}
              <Line
                dataKey="fit"
                name="Fit / Sizing"
                stroke="#252421"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: '#252421' }}
              />
              <Line
                dataKey="quality"
                name="Quality Defect"
                stroke="#8A847A"
                strokeWidth={1}
                dot={false}
              />
              <Line
                dataKey="listing"
                name="Listing Mismatch"
                stroke="#BDB6AA"
                strokeWidth={1}
                dot={false}
              />
              <Line
                dataKey="logistics"
                name="Logistics"
                stroke="#D8D2C8"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Minimal legend — text only */}
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-mist flex-wrap">
            {[
              { color: '#252421', label: 'Fit / Sizing (dominant)' },
              { color: '#8A847A', label: 'Quality Defect' },
              { color: '#BDB6AA', label: 'Listing Mismatch' },
              { color: '#D8D2C8', label: 'Logistics' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-meta text-graphite">
                <span className="inline-block w-3 h-0.5 flex-shrink-0" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chart 2: What shifted this week vs last? ─────────── */}
      <section>
        <div className="mb-5">
          <h2 className="text-subsection text-charcoal mb-1">Week-over-week shift by reason</h2>
          <p className="text-compact text-graphite">
            Every category increased this week. The largest absolute jump is in Fit / Sizing (+6 returns). Buyer Remorse is the only category that declined.
          </p>
        </div>

        <div className="border border-stone rounded-card bg-surface px-5 py-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SHIFT_DATA} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E8E3DB" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8A847A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="reason"
                width={130}
                tick={{ fill: '#5F5B54', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<WarmTooltip />} />
              <Bar dataKey="prev" name="Last week" fill="#E8E3DB" radius={[0, 2, 2, 0]} barSize={8} />
              <Bar dataKey="curr" name="This week" fill="#252421" radius={[0, 2, 2, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-mist">
            <span className="flex items-center gap-1.5 text-meta text-graphite">
              <span className="inline-block w-3 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: '#E8E3DB' }} /> Last week
            </span>
            <span className="flex items-center gap-1.5 text-meta text-graphite">
              <span className="inline-block w-3 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: '#252421' }} /> This week
            </span>
          </div>
        </div>
      </section>

      {/* ── Editorial conclusions ──────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">One-line conclusions</p>
        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          {[
            {
              signal: 'Fit / Sizing',
              trend: 'up',
              conclusion: 'Persistent week-over-week growth. Likely linked to a specific batch. Investigate BT-KRS-SG-M.',
              action: '/dashboard/products',
              actionLabel: 'See problem SKUs',
            },
            {
              signal: 'Quality / Defect',
              trend: 'up',
              conclusion: 'Slow but steady increase since Week 3. Embroidered Dupatta Rust is the top contributor.',
              action: '/dashboard/returns?category=Quality',
              actionLabel: 'Filter returns',
            },
            {
              signal: 'Listing Mismatch',
              trend: 'up',
              conclusion: 'Photography discrepancy for Men\'s Chino Dark Teal is driving most of these returns.',
              action: '/dashboard/recommendations',
              actionLabel: 'See prescribed action',
            },
            {
              signal: 'Buyer Remorse',
              trend: 'down',
              conclusion: 'Slight decline this week — positive signal, but the sample is small.',
              action: null,
              actionLabel: null,
            },
          ].map(({ signal, trend, conclusion, action, actionLabel }) => (
            <div key={signal} className="flex items-start gap-4 px-5 py-4">
              <div className="mt-0.5 flex-shrink-0">
                {trend === 'up'
                  ? <TrendingUp className="w-4 h-4 text-attention" />
                  : <TrendingDown className="w-4 h-4 text-success" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-compact font-semibold text-charcoal mb-0.5">{signal}</p>
                <p className="text-compact text-graphite">{conclusion}</p>
              </div>
              {action && (
                <Link to={action} className="rs-btn-quiet text-[13px] flex-shrink-0">
                  {actionLabel} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
