import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck, UserCheck, RefreshCw, BarChart2 } from 'lucide-react';

const STATUS_CYCLE = ['todo', 'in_progress', 'implemented', 'validated'];
const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  implemented: 'Implemented (Evaluating)',
  validated: 'Validated Impact'
};
const STATUS_VARIANTS = {
  todo: 'attention',
  in_progress: 'info',
  implemented: 'info',
  validated: 'success'
};

const StatusIcon = ({ status }) => {
  if (status === 'validated')   return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (status === 'implemented') return <BarChart2 className="w-5 h-5 text-sky-400" />;
  if (status === 'in_progress') return <Clock className="w-5 h-5 text-indigo-400" />;
  return <Circle className="w-5 h-5 text-amber-400" />;
};

export const RecommendationsPage = () => {
  const [actions, setActions]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [approving, setApproving] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.getRecommendations()
      .then((res) => setActions(res?.data || []))
      .catch(() => setActions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (action) => {
    setApproving(action.id);
    try {
      await api.approveRecommendation(action.id, `Approved intervention on ${new Date().toLocaleDateString()}`);
      setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'in_progress', approved_by: 'Operator' } : a));
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApproving(null);
    }
  };

  const cycleStatus = async (action) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(action.status) + 1) % STATUS_CYCLE.length];
    setUpdating(action.id);
    try {
      await api.updateRecommendation?.(action.id, { status: next });
      setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, status: next } : a));
    } catch {
      setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, status: next } : a));
    } finally {
      setUpdating(null);
    }
  };

  const toDo       = actions.filter((a) => !a.status || a.status === 'todo');
  const inProgress = actions.filter((a) => a.status === 'in_progress' || a.status === 'implemented');
  const validated  = actions.filter((a) => a.status === 'validated');

  if (loading) return (
    <div className="py-16 text-center text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
      <p className="text-xs">Loading operational action hub from n8n run…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Prescribed Actions Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-backed operational interventions synthesized by n8n. Approve consequential decisions and record measurement plans.
          </p>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs font-semibold">
            {toDo.length} To Do
          </span>
          <span className="px-3 py-1 rounded-lg bg-indigo-950/50 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            {inProgress.length} Active / Evaluating
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
            {validated.length} Validated
          </span>
        </div>
      </div>

      {/* Action List */}
      {actions.length === 0 ? (
        <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <p className="text-sm font-semibold text-slate-300">No actions prescribed yet.</p>
          <p className="text-xs text-slate-400">Upload a returns dataset to let n8n synthesize verified recommendations.</p>
          <a href="/dashboard/import" className="rs-btn-primary text-xs inline-block">Go to Import Page</a>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onCycle={cycleStatus}
              onApprove={handleApprove}
              updating={updating === action.id}
              approving={approving === action.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ActionCard = ({ action, onCycle, onApprove, updating, approving }) => {
  const status = action.status || 'todo';
  const isValidated = status === 'validated';
  const isImplemented = status === 'implemented';
  const requiresApproval = action.requires_human_approval && status === 'todo';

  return (
    <div className={`bg-[#111827] border rounded-xl overflow-hidden shadow-sm transition-all ${isValidated ? 'border-emerald-800/60' : 'border-slate-800 hover:border-slate-700'}`}>
      {/* Main content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => onCycle(action)}
              disabled={updating}
              className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
              title="Click to cycle status (To Do -> In Progress -> Implemented -> Validated)"
            >
              <StatusIcon status={status} />
            </button>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {action.title || action.action || action.recommendation}
                </h3>
                {action.priority && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${action.priority === 'P0' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                    {action.priority} Priority
                  </span>
                )}
                {action.target && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-indigo-300">
                    Target: {action.target}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {action.reason || action.rationale}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {requiresApproval && (
              <button
                onClick={() => onApprove(action)}
                disabled={approving}
                className="rs-btn-primary text-xs flex items-center gap-1.5"
                style={{ height: 32, padding: '0 12px' }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                {approving ? 'Recording…' : 'Approve & Record Intervention'}
              </button>
            )}
            <button
              onClick={() => onCycle(action)}
              disabled={updating}
              className="flex-shrink-0 cursor-pointer"
              title="Click to change status"
            >
              <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
            </button>
          </div>
        </div>

        {/* Evidence & Measurement Plan */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          {action.evidence_summary || action.evidence ? (
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800/80 text-xs">
              <p className="text-slate-400 mb-0.5 font-semibold">Supporting Evidence:</p>
              <p className="text-slate-200">{action.evidence_summary || action.evidence}</p>
            </div>
          ) : null}

          {action.measurement_plan && (
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800/80 text-xs space-y-0.5">
              <p className="text-slate-400 font-semibold">Measurement Plan (Outcome Test):</p>
              <p className="text-slate-200">
                Tracking: <strong className="text-indigo-300">{action.measurement_plan.metric_to_track}</strong> ({action.measurement_plan.evaluation_window_days}d window)
              </p>
              <p className="text-slate-300 font-num">
                Baseline: <span className="text-amber-400">{action.measurement_plan.baseline_value}</span> → Target: <span className="text-emerald-400">{action.measurement_plan.target_value}</span>
              </p>
            </div>
          )}
        </div>

        {/* Human approval disclaimer if applicable */}
        {action.approval_reason && (
          <div className="bg-amber-950/30 border border-amber-800/50 p-2.5 rounded-lg text-xs text-amber-300 flex items-center gap-2">
            <span className="font-bold">Human-in-the-loop:</span> {action.approval_reason}
          </div>
        )}

        {/* Implementation / Outcome note */}
        {isImplemented && (
          <div className="bg-sky-950/30 p-3 rounded-lg border border-sky-800/50 text-xs text-sky-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Implementation complete. Currently undergoing evaluation window for post-intervention return delta.</span>
          </div>
        )}

        {isValidated && (
          <div className="bg-emerald-950/40 p-3.5 rounded-lg border border-emerald-800/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{action.measured_outcome || 'Target reduction verified across post-intervention batch.'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
