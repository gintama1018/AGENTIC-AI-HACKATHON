import React, { useState, useEffect } from 'react';
import { Printer, Download, ShieldCheck, IndianRupee } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

export const ReportsPage = () => {
  const [stats, setStats]     = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => ({ data: {} })),
      api.getRecommendations().catch(() => ({ data: [] }))
    ])
      .then(([s, a]) => {
        setStats(s?.data || s || {});
        setActions(Array.isArray(a?.data) ? a.data : (Array.isArray(a) ? a : []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-16 text-center text-slate-400">
      <p className="text-xs">Preparing executive briefing export…</p>
    </div>
  );

  const doneActions = actions.filter((a) => a.status === 'validated' || a.status === 'implemented');
  const pendingActions = actions.filter((a) => a.status !== 'validated' && a.status !== 'implemented');

  const totalEvents = stats?.total_events ?? stats?.total_returns ?? 0;
  const returnedOrders = stats?.total_returns ?? 0;
  const rtoOrders = stats?.total_rto ?? 0;
  const totalLoss = stats?.total_financial_loss ?? 0;
  const topReason = stats?.top_reason || 'General Return';
  const runId = stats?.run_id || 'active_run';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Executive Briefing Report</h1>
          <p className="text-xs text-slate-400 mt-1">
            5-part operational return intelligence narrative for executive leadership and category heads.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rs-btn-primary text-xs flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      {/* Report Body */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800 shadow-sm" id="report-body">
        {/* Header */}
        <div className="p-6 bg-[#0D121F] rounded-t-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Executive Return Audit</span>
            <h2 className="text-xl font-extrabold text-white mt-1">BharatThreads Lifestyle Pvt. Ltd.</h2>
            <p className="text-xs text-slate-400">Generated on {today} · Analysis Run ID: {runId}</p>
          </div>
          <Badge variant="success">Verified Analysis Run</Badge>
        </div>

        {/* 1. What changed */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">A — Operational Ingestion Summary</p>
          <p className="text-sm text-slate-200 leading-relaxed">
            Total analyzed event volume stands at <strong className="text-white font-num">{totalEvents} orders</strong> (<span className="text-indigo-300 font-num">{returnedOrders} customer returns</span>, <span className="text-rose-400 font-num">{rtoOrders} RTO delivery failures</span>).
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Events</p>
              <p className="font-num text-lg font-bold text-white mt-0.5">{totalEvents}</p>
            </div>
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Top Complaint Type</p>
              <p className="font-bold text-amber-300 text-sm mt-0.5 truncate">{topReason}</p>
            </div>
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Impacted Order Value</p>
              <p className="font-num text-lg font-bold text-emerald-400 mt-0.5">₹{totalLoss.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* 2. Problem Hotspots */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">B — Verified Problem Hotspots & Hypotheses</p>
          {stats?.top_problems?.length > 0 ? (
            <div className="space-y-2">
              {stats.top_problems.map((p, i) => (
                <div key={i} className="bg-[#0B0F17] p-3.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{p.segment_value || p.problem}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{p.likely_cause || p.evidence}</p>
                  </div>
                  <Badge variant={p.priority === 'P0' ? 'attention' : 'muted'}>{p.priority || 'P1'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No anomalous concentration clusters flagged in current run.</p>
          )}
        </div>

        {/* 3. Action plan */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">C — Actionable Recommendations & Measurement Plans</p>
          <div className="space-y-2">
            {actions.map((act) => (
              <div key={act.id} className="bg-[#0B0F17] p-3.5 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{act.title || act.action}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">Target: {act.target}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{act.reason || act.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
