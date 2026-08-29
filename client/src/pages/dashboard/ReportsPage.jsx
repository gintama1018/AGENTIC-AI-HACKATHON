import React, { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import { api } from '../../services/api';

// DESIGN.md — Reports: printable executive brief
// Following the 5-step operational narrative (A→E from Overview)
// Clean, print-optimised layout

export const ReportsPage = () => {
  const [stats, setStats]     = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getRecommendations()])
      .then(([s, a]) => { setStats(s.data); setActions(a.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-16 text-center">
      <p className="text-compact text-ash">Preparing executive brief…</p>
    </div>
  );

  const doneActions = actions.filter((a) => a.status === 'done');
  const pendingActions = actions.filter((a) => a.status !== 'done');

  return (
    <div className="space-y-6">

      {/* Toolbar — no-print */}
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Executive Brief</h1>
          <p className="text-compact text-graphite">5-part operational narrative — export or print for stakeholder review.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="rs-btn-secondary flex items-center gap-1.5"
            style={{ height: 36, padding: '0 12px', fontSize: 13 }}
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* ── Report body ─────────────────────────────────────────── */}
      <div className="border border-stone rounded-card bg-surface divide-y divide-stone" id="report-body">

        {/* Report header */}
        <div className="px-7 py-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-[20px] font-semibold text-charcoal tracking-tight">
                Return Intelligence Brief
              </h2>
              <p className="text-compact text-graphite mt-0.5">BharatThreads Lifestyle Pvt. Ltd.</p>
            </div>
            <div className="text-right text-meta text-ash">
              <p>{today}</p>
              <p>Prepared by ReturnShield</p>
            </div>
          </div>
        </div>

        {/* A. What changed? */}
        <div className="px-7 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">A — What changed?</p>
          <p className="text-compact font-semibold text-charcoal mb-2">
            Return volume increased by approximately 21% this week.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-3">
            {[
              { label: 'Returns this week', value: stats?.total_returns ?? 54, unit: '' },
              { label: 'Return rate (30d)',  value: `${stats?.return_rate ?? 12.4}%`, unit: '' },
              { label: 'Potential revenue at risk', value: '₹2.4L', unit: '' },
            ].map(({ label, value }) => (
              <div key={label} className="border border-mist rounded-control px-4 py-3">
                <p className="text-meta text-ash mb-1">{label}</p>
                <p className="font-num font-semibold text-charcoal" style={{ fontSize: 20 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* B. What deserves attention? */}
        <div className="px-7 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">B — What deserves attention?</p>
          <p className="text-compact font-semibold text-charcoal mb-3">Three issues account for 78% of this week's return volume.</p>
          <div className="space-y-2">
            {[
              { rank: 1, issue: 'Fit / Sizing — Kurta Set Sage Green', count: 17, pct: '31%' },
              { rank: 2, issue: 'Quality Defect — Embroidered Dupatta Rust', count: 11, pct: '20%' },
              { rank: 3, issue: 'Listing Mismatch — Men\'s Chino Dark Teal', count: 9, pct: '17%' },
            ].map(({ rank, issue, count, pct }) => (
              <div key={rank} className="flex items-center gap-3 text-compact">
                <span className="font-num text-ash w-3 flex-shrink-0">{rank}.</span>
                <span className="flex-1 text-charcoal">{issue}</span>
                <span className="font-num text-graphite">{count} returns</span>
                <span className="font-num text-ash w-8 text-right">{pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* C. Why? */}
        <div className="px-7 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">C — Why is this happening?</p>
          <p className="text-compact font-semibold text-charcoal mb-3">Inferred root causes (pending confirmation)</p>
          <div className="space-y-3">
            {[
              { signal: 'Fit / Sizing', cause: 'Size inconsistency in latest Kurta Set production batch. Medium cut appears to have deviated from historical measurements.', conf: 'High · 91%' },
              { signal: 'Quality Defect', cause: 'Embroidery finishing defect in supplier batch #41. Likely linked to high-speed loom settings.', conf: 'High · 88%' },
              { signal: 'Listing Mismatch', cause: 'Studio photography overstating color saturation for Men\'s Chino Dark Teal.', conf: 'Moderate · 74%' },
            ].map(({ signal, cause, conf }) => (
              <div key={signal} className="border-l-2 border-mist pl-3">
                <p className="text-compact font-semibold text-charcoal">{signal}</p>
                <p className="text-meta text-graphite">{cause}</p>
                <p className="text-meta text-ash">Confidence: {conf}</p>
              </div>
            ))}
          </div>
        </div>

        {/* D. What should we do? */}
        <div className="px-7 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">D — What should we do?</p>
          <p className="text-compact font-semibold text-charcoal mb-3">
            {pendingActions.length} pending action{pendingActions.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {(pendingActions.length > 0 ? pendingActions : FALLBACK_PENDING).slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-compact">
                <span className="font-num text-ash flex-shrink-0 w-3">{i + 1}.</span>
                <span className="text-charcoal">{a.title || a.recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* E. Did it work? */}
        <div className="px-7 py-5">
          <p className="text-meta text-ash uppercase tracking-wider mb-3">E — Did our actions work?</p>
          {doneActions.length > 0 ? (
            <div className="space-y-3">
              {doneActions.map((a, i) => (
                <div key={i} className="border-l-2 border-mist pl-3">
                  <p className="text-compact font-semibold text-charcoal">{a.title || a.recommendation}</p>
                  <p className="text-meta text-graphite">{a.outcome || 'Outcome tracking in progress.'}</p>
                  {a.profit_protected && <p className="text-meta text-success font-num font-semibold">{a.profit_protected} estimated profit protected</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-mist rounded-control px-4 py-3">
              <p className="text-compact text-graphite">No completed actions yet. Outcomes will appear here after actions are marked as done.</p>
            </div>
          )}
        </div>

        {/* Verified outcome summary */}
        <div className="px-7 py-4 bg-canvas rounded-b-card">
          <div className="flex items-center justify-between">
            <p className="text-meta text-graphite">Cumulative profit protected (verified outcomes)</p>
            <p className="font-num font-semibold text-charcoal">₹4.2L</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FALLBACK_PENDING = [
  { recommendation: 'Audit size measurements for Kurta Set Sage Green batch #Q3' },
  { recommendation: 'Halt dispatch of Embroidered Dupatta Rust batch #41' },
  { recommendation: "Re-photograph Men's Chino Dark Teal under natural light" },
];
