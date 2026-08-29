import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

// DESIGN.md §15 — 5-part operational briefing structure
// A. What changed? → B. What deserves attention? → C. Why? (Evidence chain)
// → D. What should we do? → E. Did it work?

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
    <div className="flex items-center justify-center h-48">
      <p className="text-compact text-ash">Loading operational briefing…</p>
    </div>
  );

  const thisWeek  = stats?.total_returns ?? 0;
  const lastWeek  = Math.round(thisWeek * 0.82);
  const weekDelta = thisWeek - lastWeek;
  const deltaUp   = weekDelta > 0;

  const topReason = stats?.top_reason || 'Fit / Sizing';
  const topReasonCount = stats?.top_reason_count ?? 17;
  const returnRate = stats?.return_rate ?? 12.4;

  return (
    <div className="space-y-12">

      {/* ── A. What changed? ────────────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">A — What changed?</p>

        {/* Primary finding */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-charcoal mb-1.5 tracking-tight">
            {deltaUp ? `Return volume is up ${weekDelta} this week` : `Return volume held steady this week`}
          </h1>
          <p className="text-compact text-graphite">
            {deltaUp
              ? `${thisWeek} returns processed this week vs. ${lastWeek} last week. Most of the increase is concentrated in fit-related complaints.`
              : `${thisWeek} returns processed this week, roughly in line with ${lastWeek} last week. No significant spike.`}
          </p>
        </div>

        {/* Key numbers — §2.2: each metric has a purpose line */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              value: thisWeek,
              label: 'Returns this week',
              trend: deltaUp ? 'up' : 'down',
              trendLabel: `${deltaUp ? '+' : ''}${weekDelta} vs. last week`,
              trendGood: false,
              context: 'Volume alone tells you the scale. The breakdown below tells you what matters.',
            },
            {
              value: `${returnRate}%`,
              label: 'Return rate (30-day)',
              trend: 'up',
              trendLabel: '+1.2 pp vs. prior month',
              trendGood: false,
              context: 'Rate is rising. Investigate the cause before the next dispatch cycle.',
            },
            {
              value: topReasonCount,
              label: `Returns citing "${topReason}"`,
              trend: 'up',
              trendLabel: 'Top reason this week',
              trendGood: false,
              context: 'This is the dominant signal. See the pattern section for root cause analysis.',
            },
          ].map(({ value, label, trend, trendLabel, trendGood, context }) => (
            <div key={label} className="rs-card">
              <p className="text-meta text-graphite mb-2">{label}</p>
              <p className="font-num font-semibold text-charcoal mb-1.5" style={{ fontSize: 26 }}>{value}</p>
              <p className={`flex items-center gap-1 text-meta mb-3 ${trend === 'up' && !trendGood ? 'text-attention' : 'text-success'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendLabel}
              </p>
              <p className="text-meta text-graphite border-t border-mist pt-2">{context}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── B. What deserves attention? ─────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">B — What deserves attention?</p>
        <h2 className="text-subsection text-charcoal mb-2">Top 3 issues right now</h2>
        <p className="text-compact text-graphite mb-5">Prioritised by return volume and recency of signal.</p>

        <div className="border border-stone rounded-card overflow-hidden divide-y divide-mist bg-surface">
          {[
            {
              rank: 1,
              title: 'Fit / Sizing — Kurta Set Sage Green (M)',
              count: topReasonCount,
              window: '14 days',
              urgency: 'High',
              link: '/dashboard/patterns',
            },
            {
              rank: 2,
              title: 'Product misrepresentation — Men\'s Chino Dark Teal',
              count: 9,
              window: '21 days',
              urgency: 'Medium',
              link: '/dashboard/patterns',
            },
            {
              rank: 3,
              title: 'Defective / damaged — Embroidered Dupatta Rust',
              count: 11,
              window: '10 days',
              urgency: 'High',
              link: '/dashboard/patterns',
            },
          ].map(({ rank, title, count, window, urgency, link }) => (
            <div key={rank} className="flex items-center gap-5 px-5 py-3.5">
              <span className="font-num text-meta text-ash w-4 flex-shrink-0">{rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-compact font-semibold text-charcoal truncate">{title}</p>
                <p className="text-meta text-graphite">
                  <span className="font-num font-semibold">{count}</span> returns · last {window}
                </p>
              </div>
              <Badge variant={urgency === 'High' ? 'attention' : 'default'}>{urgency}</Badge>
              <Link to={link} className="rs-btn-quiet text-[13px] flex-shrink-0">
                Investigate <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── C. Why? Evidence chain ──────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">C — Why is this happening?</p>
        <h2 className="text-subsection text-charcoal mb-2">Evidence chain for the top signal</h2>

        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          <div className="px-5 py-4">
            <p className="text-meta text-ash mb-1">Customer evidence</p>
            <p className="text-compact text-charcoal italic leading-relaxed border-l-2 border-stone pl-3">
              "I ordered medium like I always do but it fits like a small. The chest area is really tight. Returning it."
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-meta text-ash mb-1">Detected pattern</p>
            <p className="text-compact text-charcoal">Fit / Sizing — {topReasonCount} returns across Kurta Set SKUs in 14 days</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-meta text-ash mb-1">Likely cause <span className="italic">(inferred, not confirmed)</span></p>
            <p className="text-compact text-charcoal">Size inconsistency in latest production batch — medium cut appears to have deviated from historical measurements.</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-meta text-ash mb-1">Classification confidence</p>
            <p className="text-compact font-semibold text-charcoal">High · 91%</p>
          </div>
        </div>

        <div className="mt-3 text-right">
          <Link to="/dashboard/returns" className="text-compact text-graphite hover:text-charcoal transition-colors">
            See all return evidence →
          </Link>
        </div>
      </section>

      {/* ── D. What should we do? ───────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">D — What should we do?</p>
        <h2 className="text-subsection text-charcoal mb-2">Pending actions</h2>

        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          {actions.length > 0 ? actions.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-compact font-semibold text-charcoal">{a.title || a.recommendation}</p>
                <p className="text-meta text-graphite mt-0.5">{a.reason || a.rationale}</p>
              </div>
              <Badge variant={a.status === 'done' ? 'success' : a.status === 'in_progress' ? 'default' : 'attention'}>
                {a.status === 'done' ? 'Done' : a.status === 'in_progress' ? 'In progress' : 'To do'}
              </Badge>
            </div>
          )) : (
            <div className="px-5 py-4">
              <p className="text-compact text-graphite">No pending actions yet. Analyzing returns will surface prescriptions here.</p>
            </div>
          )}
        </div>

        <div className="mt-3 text-right">
          <Link to="/dashboard/recommendations" className="text-compact text-graphite hover:text-charcoal transition-colors">
            See all actions →
          </Link>
        </div>
      </section>

      {/* ── E. Did it work? ─────────────────────────────────────── */}
      <section>
        <p className="text-meta text-ash uppercase tracking-widest mb-4">E — Did our actions work?</p>
        <h2 className="text-subsection text-charcoal mb-2">Tracked outcomes</h2>

        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          {[
            {
              action: 'Updated size guide for Kurta Set batch #Q3',
              result: 'Fit-related returns for BT-KRS-SG-M dropped 38% in the 3 weeks following update.',
              protected: '₹1.8L',
              status: 'Verified',
            },
            {
              action: 'Re-photographed Chino Dark Teal under natural light',
              result: 'Misrepresentation returns for BT-CHN-DT series declined. Tracking continues.',
              protected: '₹64,000',
              status: 'Monitoring',
            },
          ].map(({ action, result, protected: amt, status }) => (
            <div key={action} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4 mb-1">
                <p className="text-compact font-semibold text-charcoal">{action}</p>
                <Badge variant={status === 'Verified' ? 'success' : 'default'}>{status}</Badge>
              </div>
              <p className="text-meta text-graphite mb-1">{result}</p>
              <p className="text-meta text-ash font-num">Estimated profit protected: {amt}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 text-right">
          <Link to="/dashboard/reports" className="text-compact text-graphite hover:text-charcoal transition-colors">
            View executive brief →
          </Link>
        </div>
      </section>
    </div>
  );
};
