import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, ShieldAlert, Sparkles, Activity, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const OverviewPage = () => {
  const [stats, setStats]       = useState(null);
  const [actions, setActions]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => ({})),
      api.getRecommendations().catch(() => ({ data: [] }))
    ])
      .then(([s, a]) => {
        setStats(s || {});
        const actionList = Array.isArray(a?.data) ? a.data : (Array.isArray(a) ? a : []);
        setActions(actionList.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-56 text-slate-400 gap-2">
      <Activity className="w-5 h-5 animate-spin text-indigo-400" />
      <span className="text-sm font-medium">Loading operational briefing from n8n run…</span>
    </div>
  );

  const m = stats?.metrics || stats || {};
  const totalEvents = m.totalEvents ?? m.totalReturns ?? 0;
  const returnedOrders = m.totalReturns ?? 0;
  const rtoOrders = m.totalRto ?? 0;
  const ratesAvailable = !!m.ratesAvailable;

  const topReason = m.topReason || stats?.top_reason || 'No events analyzed';
  const topReasonCount = m.topReasonCount ?? stats?.top_reason_count ?? 0;
  const totalFinancialLoss = m.totalFinancialLoss || 0;
  const runId = m.runId || stats?.run_id || 'uninitialized';
  const intelligenceSource = m.intelligenceSource || stats?.intelligence_source || 'n8n';
  const verificationPassed = m.verificationPassed ?? true;
  const topProblems = stats?.topProblems || stats?.top_problems || [];
  const hypotheses = stats?.hypotheses || [];
  const dataGaps = stats?.dataGaps || stats?.data_gaps || [];

  return (
    <div className="space-y-10">

      {/* ── Run & Verification Banner ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Run ID: {runId}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${intelligenceSource === 'n8n' ? 'bg-indigo-900/60 border-indigo-700 text-indigo-300' : 'bg-amber-900/60 border-amber-700 text-amber-300'}`}>
                {intelligenceSource === 'n8n' ? 'n8n + Gemini Authoritative' : 'Local Deterministic Fallback'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Deterministic Analytics + Gemini Reason Classifier + 6-Check Self-Verification Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={verificationPassed ? 'success' : 'attention'}>
            {verificationPassed ? 'Self-Verification Passed' : 'Verification Under Review'}
          </Badge>
        </div>
      </div>

      {/* ── A. What changed? ────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            A — Operational Executive Briefing
          </p>
          <span className="text-xs text-slate-400 font-num">Live Verified Run State</span>
        </div>

        {/* Primary finding */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 rounded-xl p-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
            {totalEvents > 0 ? `${totalEvents} Return & RTO Events Analyzed in Current Run` : 'No Return Events Ingested Yet'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {totalEvents > 0 ? (
              <>
                <strong className="text-white font-num">{returnedOrders} customer returns</strong> and <strong className="text-rose-400 font-num">{rtoOrders} RTO delivery failures</strong> processed.
                Primary concentration detected in <strong className="text-amber-300">"{topReason}"</strong> ({topReasonCount} events).
              </>
            ) : (
              'Upload a return batch via the Import page to trigger Workflow 1 classification and concentration detection.'
            )}
          </p>
        </div>

        {/* Key numbers */}
        <div className="grid sm:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Return Events</p>
            <p className="font-num text-3xl sm:text-4xl font-extrabold text-white leading-none">
              {returnedOrders}
            </p>
            <p className="text-xs text-slate-400">
              Post-delivery customer returns
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total RTO Events</p>
            <p className="font-num text-3xl sm:text-4xl font-extrabold text-rose-400 leading-none">
              {rtoOrders}
            </p>
            <p className="text-xs text-slate-400">
              Pre-delivery logistics & courier rejections
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Affected Order Value</p>
            <p className="font-num text-3xl sm:text-4xl font-extrabold text-emerald-400 leading-none">
              ₹{totalFinancialLoss.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400">
              Gross merchandise value impacted
            </p>
          </div>
        </div>

        {!ratesAvailable && totalEvents > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Honest Metric Guard: Total shipped order summary was omitted; showing event counts and within-dataset shares rather than unverified percentage rates.</span>
          </div>
        )}
      </section>

      {/* ── B. Why is it happening? ─────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            B — Competing Root-Cause Hypotheses & Evidence
          </p>
          <span className="text-xs text-slate-400">Empirical Discrimination</span>
        </div>

        {topProblems.length === 0 ? (
          <p className="text-xs text-slate-400">No high-concentration problem hotspots identified in current dataset.</p>
        ) : (
          <div className="space-y-4">
            {topProblems.map((prob, i) => (
              <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {prob.priority || prob.priority_tier || 'P0'} Hotspot
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Dimension: {prob.dimension || 'Segment'}
                      </span>
                      {prob.sufficient_evidence === false && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Low Sample (Gated Hypothesis)
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{prob.segment_value || prob.problem}</h3>
                    <p className="text-xs text-slate-300 mt-1">{prob.evidence || prob.likely_cause}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-400">Affected Value</p>
                    <p className="font-num text-sm font-bold text-emerald-400">
                      ₹{(prob.order_value_lost_inr || prob.affected_order_value_inr || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Hypotheses Breakdown */}
                {prob.hypotheses && prob.hypotheses.length > 0 && (
                  <div className="bg-[#0B0F17] rounded-lg p-4 border border-slate-800/80 space-y-3">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Competing Hypotheses & Verification Procedure</p>
                    <div className="space-y-2.5">
                      {prob.hypotheses.map((h, idx) => (
                        <div key={idx} className="border-l-2 border-indigo-500 pl-3 space-y-1 text-xs">
                          <p className="text-slate-200 font-semibold">
                            Hypothesis {idx + 1}: "{h.hypothesis}"
                          </p>
                          <p className="text-slate-400">
                            <strong className="text-slate-300">Supporting Evidence:</strong> {h.supporting_evidence}
                          </p>
                          <p className="text-slate-400">
                            <strong className="text-slate-300">Prescribed Next Test:</strong> <span className="text-amber-300">{h.next_test}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── C. Prescribed Actions ─────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            C — Prescribed Operational Actions & Human Approvals
          </p>
          <Link to="/dashboard/recommendations" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All in Action Hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {actions.length === 0 ? (
          <p className="text-xs text-slate-400">No actions currently pending approval.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {actions.map((act) => (
              <div key={act.id} className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {act.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Target: {act.target}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{act.title || act.action}</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{act.reason || act.rationale}</p>
                {act.measurement_plan && (
                  <p className="text-[11px] text-indigo-300 font-medium">
                    Tracking: {act.measurement_plan.metric_to_track} ({act.measurement_plan.evaluation_window_days}d evaluation window)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
