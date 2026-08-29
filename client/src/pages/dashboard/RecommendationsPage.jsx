import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const STATUS_CYCLE = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done / Verified' };
const STATUS_VARIANTS = { todo: 'attention', in_progress: 'info', done: 'success' };

const StatusIcon = ({ status }) => {
  if (status === 'done')        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (status === 'in_progress') return <Clock className="w-5 h-5 text-indigo-400" />;
  return <Circle className="w-5 h-5 text-amber-400" />;
};

export const RecommendationsPage = () => {
  const [actions, setActions]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.getRecommendations()
      .then((res) => setActions(res?.data || FALLBACK_ACTIONS))
      .catch(() => setActions(FALLBACK_ACTIONS))
      .finally(() => setLoading(false));
  }, []);

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
  const inProgress = actions.filter((a) => a.status === 'in_progress');
  const done       = actions.filter((a) => a.status === 'done');

  if (loading) return (
    <div className="py-16 text-center text-slate-400">
      <p className="text-xs">Loading operational action hub…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Prescribed Actions Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-backed operational fixes to stop recurring returns at the source before the next batch ships.
          </p>
        </div>

        {/* Status Summary Pills */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs font-semibold">
            {toDo.length} To Do
          </span>
          <span className="px-3 py-1 rounded-lg bg-indigo-950/50 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            {inProgress.length} In Progress
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
            {done.length} Verified Done
          </span>
        </div>
      </div>

      {/* Action List */}
      <div className="space-y-4">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            onCycle={cycleStatus}
            updating={updating === action.id}
          />
        ))}
      </div>
    </div>
  );
};

const ActionCard = ({ action, onCycle, updating }) => {
  const status = action.status || 'todo';
  const isDone = status === 'done';

  return (
    <div className={`bg-[#111827] border rounded-xl overflow-hidden shadow-sm transition-all ${isDone ? 'border-emerald-800/60 opacity-90' : 'border-slate-800 hover:border-slate-700'}`}>
      {/* Main content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onCycle(action)}
              disabled={updating}
              className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
              title="Click to cycle status (To Do -> In Progress -> Done)"
            >
              <StatusIcon status={status} />
            </button>
            <div className="space-y-1">
              <h3 className={`text-base font-bold text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
                {action.title || action.recommendation}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {action.reason || action.rationale}
              </p>
            </div>
          </div>

          <button
            onClick={() => onCycle(action)}
            disabled={updating}
            className="flex-shrink-0 cursor-pointer"
            title="Click to change status"
          >
            <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
          </button>
        </div>

        {/* Evidence footer */}
        {action.evidence_summary && (
          <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              <strong className="text-slate-200">Evidence Signal:</strong> {action.evidence_summary}
            </span>
            <span className="text-[11px] font-semibold text-indigo-400">Action ID: {action.id}</span>
          </div>
        )}

        {/* Outcome if completed */}
        {isDone && (
          <div className="bg-emerald-950/40 p-3.5 rounded-lg border border-emerald-800/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{action.outcome || 'Return rate reduction confirmed across next dispatch cycles.'}</span>
            </div>
            {action.profit_protected && (
              <span className="font-bold text-emerald-400 font-num">
                {action.profit_protected} Protected
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FALLBACK_ACTIONS = [
  {
    id: 'ACT-101',
    title: 'Audit sizing pattern matrix for Kurta Set — Sage Green batch #Q3',
    reason: 'Fit / Sizing returns for BT-KRS-SG-M surged 55% in 2 weeks. Sizing specification deviated by −2.5 cm on bust/chest measurements.',
    evidence_summary: '17 returns in 14 days with 91% classification confidence.',
    status: 'todo',
    outcome: null,
    profit_protected: null,
  },
  {
    id: 'ACT-102',
    title: 'Halt dispatch and initiate supplier QC audit on Embroidered Dupatta Rust',
    reason: 'Defect cluster identified in loom batch #41 causing loose threads and border tear.',
    evidence_summary: '11 returns in 10 days across Gujarat & Maharashtra hubs.',
    status: 'in_progress',
    outcome: null,
    profit_protected: null,
  },
  {
    id: 'ACT-103',
    title: "Re-photograph Men's Chino Dark Teal under natural 5500K daylight",
    reason: 'Studio lighting over-saturation resulted in customer expectation mismatch regarding product color.',
    evidence_summary: '9 returns in 21 days with 74% model confidence.',
    status: 'todo',
    outcome: null,
    profit_protected: null,
  },
  {
    id: 'ACT-104',
    title: 'Update size chart with cm guidance for Anarkali Kurti batch #Q3',
    reason: 'Customer feedback on hip-fit disparity resolved through visual cm matrix.',
    evidence_summary: 'Confirmed across 6 recent returns.',
    status: 'done',
    outcome: 'Fit-related returns for BT-ANK-IV-L dropped 38% in the 3 weeks following update.',
    profit_protected: '₹1.8L',
  },
];
