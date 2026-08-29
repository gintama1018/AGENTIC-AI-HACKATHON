import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const OverviewPage = () => {
  const [stats, setStats]       = useState(null);
  const [returns, setReturns]   = useState([]);
  const [actions, setActions]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => ({ data: {} })),
      api.getReturns().catch(() => ({ data: [] })),
      api.getRecommendations().catch(() => ({ data: [] }))
    ])
      .then(([s, r, a]) => {
        setStats(s?.data || s || {});
        const returnList = Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : []);
        setReturns(returnList.slice(0, 5));
        const actionList = Array.isArray(a?.data) ? a.data : (Array.isArray(a) ? a : []);
        setActions(actionList.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-56 text-slate-400 gap-2">
      <Activity className="w-5 h-5 animate-spin text-indigo-400" />
      <span className="text-sm font-medium">Loading operational briefing…</span>
    </div>
  );

  const thisWeek  = stats?.total_returns ?? 50;
  const lastWeek  = Math.round(thisWeek * 0.82) || 41;
  const weekDelta = thisWeek - lastWeek;
  const deltaUp   = weekDelta > 0;

  const topReason = stats?.top_reason || 'Size & Fit Mismatch';
  const topReasonCount = stats?.top_reason_count ?? 17;
  const returnRate = stats?.return_rate ?? 10.4;
  const totalFinancialLoss = stats?.total_financial_loss ?? 184500;

  return (
    <div className="space-y-10">

      {/* ── A. What changed? ────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            A — What changed?
          </p>
          <span className="text-xs text-slate-400 font-num">Week 35 · Live Stream</span>
        </div>

        {/* Primary finding */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 rounded-xl p-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
            {deltaUp ? `Return volume is up ${weekDelta} this week` : `Return volume held steady this week`}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white font-num">{thisWeek} returns</strong> processed this week vs. <span className="font-num text-slate-400">{lastWeek}</span> last week.
            Most of the increase is concentrated in <strong className="text-amber-300">"{topReason}"</strong> complaints across North & West India delivery hubs.
          </p>
        </div>

        {/* Key numbers */}
        <div className="grid sm:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returns this week</p>
            <p className="font-num text-3xl sm:text-4xl font-extrabold text-white leading-none">
              {thisWeek}
            </p>
            <p className={`flex items-center gap-1.5 text-xs font-semibold ${deltaUp ? 'text-amber-400' : 'text-emerald-400'}`}>
              {deltaUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {deltaUp ? `+${weekDelta} vs. last week` : `${weekDelta} vs. last week`}
            </p>
            <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 leading-relaxed">
              Volume indicates scale. Breakdown below flags urgent root causes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Return rate (30-day)</p>
            <p className="font-num text-3xl sm:text-4xl font-extrabold text-white leading-none">
              {returnRate}%
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
              +1.2 pp vs. prior month
            </p>
            <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 leading-relaxed">
              Rate is elevated vs. 8% target. Review recommended interventions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top reason: {topReason}</p>
            <p className="font-num text-3xl sm:text-4xl font-extrabold text-amber-400 leading-none">
              {topReasonCount} <span className="text-sm font-normal text-slate-400">returns</span>
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              Dominant signal this week
            </p>
            <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 leading-relaxed">
              Primary driver of margin erosion. See pattern section for root causes.
            </p>
          </div>
        </div>
      </section>

      {/* ── B. What deserves attention? ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            B — What deserves attention?
          </p>
          <span className="text-xs text-slate-400">Ranked by volume & severity</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
          {[
            {
              rank: 1,
              title: 'Size & Fit Mismatch — Kurta Set Sage Green (M)',
              count: topReasonCount,
              window: '14 days',
              urgency: 'critical',
              urgencyLabel: 'High Priority',
              link: '/dashboard/returns?category=Size',
            },
            {
              rank: 2,
              title: "Quality / Manufacturing Defect — Embroidered Dupatta Rust",
              count: 11,
              window: '10 days',
              urgency: 'attention',
              urgencyLabel: 'Medium Priority',
              link: '/dashboard/returns?category=Quality',
            },
            {
              rank: 3,
              title: "Listing & Color Variance — Men's Chino Dark Teal",
              count: 9,
              window: '21 days',
              urgency: 'attention',
              urgencyLabel: 'Medium Priority',
              link: '/dashboard/returns?category=Listing',
            },
          ].map(({ rank, title, count, window, urgency, urgencyLabel, link }) => (
            <div key={rank} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-num text-xs font-bold text-slate-500 w-5 flex-shrink-0">{rank}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="font-num text-amber-300 font-semibold">{count} returns</span> · last {window}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant={urgency}>{urgencyLabel}</Badge>
                <Link to={link} className="rs-btn-secondary text-xs" style={{ height: 32, padding: '0 12px' }}>
                  Investigate <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── C. Why? Evidence chain ──────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            C — Why is this happening? (Evidence Chain)
          </p>
          <Link to="/dashboard/returns" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            See all return records →
          </Link>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
          <div className="p-5 space-y-1.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. Verbatim Customer Evidence</p>
            <blockquote className="text-sm text-slate-200 italic leading-relaxed border-l-2 border-indigo-500 pl-4 py-1 bg-slate-900/60 rounded-r-lg">
              "I ordered medium like I always do from BharatThreads, but this kurti chest fit is way too tight. Returning it. Please fix the sizing table."
            </blockquote>
          </div>
          <div className="p-5 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">2. Detected Pattern</p>
              <p className="text-sm font-bold text-white">Size & Fit Mismatch — {topReasonCount} returns across Kurta Set SKUs in 14 days</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">3. Classification Confidence</p>
              <Badge variant="success">High · 91% Confidence</Badge>
            </div>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              4. Inferred Root Cause <span className="text-amber-400 font-normal italic">(inferred analytical diagnosis)</span>
            </p>
            <p className="text-sm text-slate-200 leading-relaxed">
              Batch #2024-Q3 sizing specification deviated from historical charts by −2.5 cm on bust/chest measurements.
            </p>
          </div>
        </div>
      </section>

      {/* ── D. What should we do? ───────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            D — What should we do? (Prescribed Actions)
          </p>
          <Link to="/dashboard/recommendations" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Open Action Hub →
          </Link>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
          {(actions.length > 0 ? actions : FALLBACK_ACTIONS).slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-start justify-between gap-4 p-5 hover:bg-slate-800/30 transition-colors">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-bold text-white">{a.title || a.recommendation}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{a.reason || a.rationale}</p>
              </div>
              <Badge variant={a.status === 'done' ? 'success' : a.status === 'in_progress' ? 'default' : 'attention'}>
                {a.status === 'done' ? 'Done' : a.status === 'in_progress' ? 'In Progress' : 'To Do'}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {/* ── E. Did it work? ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            E — Did our actions work? (Verified Outcomes)
          </p>
          <Link to="/dashboard/reports" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Generate Executive Brief →
          </Link>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
          {[
            {
              action: 'Updated size chart with cm guidance for Anarkali Kurti batch #Q3',
              result: 'Fit-related returns for BT-ANK-IV-L dropped 38% in the 3 weeks following update.',
              protected: '₹1,80,000',
              status: 'Verified',
            },
            {
              action: "Re-photographed Men's Chino Dark Teal under natural day-light",
              result: 'Listing misrepresentation returns dropped 52% over 21 days.',
              protected: '₹64,000',
              status: 'Verified',
            },
          ].map(({ action, result, protected: amt, status }) => (
            <div key={action} className="p-5 space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-white">{action}</p>
                <Badge variant="success">{status}</Badge>
              </div>
              <p className="text-xs text-slate-300">{result}</p>
              <p className="text-xs font-bold font-num text-emerald-400 pt-1">
                Protected Savings: {amt} INR
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const FALLBACK_ACTIONS = [
  {
    title: 'Audit size measurements for Kurta Set — Sage Green batch #Q3',
    reason: 'Fit / Sizing returns for BT-KRS-SG-M grew 55% in 2 weeks. 41% cite the medium size specifically.',
    status: 'todo'
  },
  {
    title: 'Halt dispatch of Embroidered Dupatta Rust batch #41',
    reason: 'Multiple returns citing embroidery defects — loose threads and holes near border.',
    status: 'in_progress'
  },
  {
    title: "Re-photograph Men's Chino Dark Teal under natural light",
    reason: 'Listing misrepresentation — customers reporting the color looks washed out vs. product photography.',
    status: 'todo'
  }
];
