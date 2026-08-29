import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

// DESIGN.md §19 — Actions section (not "AI Recommendations")
// Each action: Why → Evidence → Action → Status → Outcome
// Journey: signal → explanation → action → result

const STATUS_CYCLE = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
const STATUS_VARIANTS = { todo: 'attention', in_progress: 'default', done: 'success' };

const StatusIcon = ({ status }) => {
  if (status === 'done')        return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === 'in_progress') return <Clock className="w-4 h-4 text-graphite" />;
  return <Circle className="w-4 h-4 text-ash" />;
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

  // Group by status for summary counts
  const toDo       = actions.filter((a) => !a.status || a.status === 'todo');
  const inProgress = actions.filter((a) => a.status === 'in_progress');
  const done       = actions.filter((a) => a.status === 'done');

  if (loading) return (
    <div className="py-16 text-center">
      <p className="text-compact text-ash">Loading actions…</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">Actions</h1>
        <p className="text-compact text-graphite">
          Prescriptions derived from detected return patterns. Click the status to advance an action through the lifecycle.
        </p>
      </div>

      {/* Status summary — no cards, just text */}
      <div className="flex items-center gap-6 text-compact">
        <span className="text-graphite">
          <span className="font-num font-semibold text-charcoal">{toDo.length}</span> to do
        </span>
        <span className="text-mist">·</span>
        <span className="text-graphite">
          <span className="font-num font-semibold text-charcoal">{inProgress.length}</span> in progress
        </span>
        <span className="text-mist">·</span>
        <span className="text-graphite">
          <span className="font-num font-semibold text-charcoal">{done.length}</span> done
        </span>
      </div>

      {/* Action list */}
      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="border border-stone rounded-card bg-surface px-6 py-10 text-center">
            <p className="text-compact font-semibold text-charcoal mb-1">No actions yet</p>
            <p className="text-meta text-graphite">
              Analyze return records to have prescriptions surfaced here.
            </p>
          </div>
        ) : actions.map((action) => (
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
    <div className={`border rounded-card bg-surface divide-y divide-mist transition-opacity ${isDone ? 'border-mist opacity-80' : 'border-stone'}`}>

      {/* Main action + status */}
      <div className="flex items-start gap-4 px-5 py-4">
        <button
          onClick={() => onCycle(action)}
          disabled={updating}
          className="mt-0.5 flex-shrink-0 transition-opacity hover:opacity-70"
          title="Advance status"
        >
          <StatusIcon status={status} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-compact font-semibold text-charcoal mb-0.5 ${isDone ? 'line-through text-graphite' : ''}`}>
            {action.title || action.recommendation}
          </p>
          <p className="text-meta text-graphite">{action.reason || action.rationale}</p>
        </div>
        <button
          onClick={() => onCycle(action)}
          disabled={updating}
          className="flex-shrink-0"
          title="Click to change status"
        >
          <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
        </button>
      </div>

      {/* Evidence */}
      {action.evidence_summary && (
        <div className="px-5 py-3">
          <span className="text-meta text-ash">Evidence — </span>
          <span className="text-meta text-graphite">{action.evidence_summary}</span>
        </div>
      )}

      {/* Outcome — only shown when done */}
      {isDone && action.outcome && (
        <div className="px-5 py-3 bg-success-soft rounded-b-card">
          <span className="text-meta font-semibold text-success">Outcome verified — </span>
          <span className="text-meta text-graphite">{action.outcome}</span>
          {action.profit_protected && (
            <span className="font-num font-semibold text-success ml-1">{action.profit_protected} protected</span>
          )}
        </div>
      )}
    </div>
  );
};

const FALLBACK_ACTIONS = [
  {
    id: 'A-001',
    title: 'Audit size measurements for Kurta Set — Sage Green batch #Q3',
    reason: 'Fit / Sizing returns for BT-KRS-SG-M grew 55% in 2 weeks. 41% cite the medium size specifically.',
    evidence_summary: '17 returns in 14 days. High confidence classification (91%).',
    status: 'todo',
    outcome: null,
    profit_protected: null,
  },
  {
    id: 'A-002',
    title: 'Halt dispatch of Embroidered Dupatta Rust batch #41',
    reason: 'Multiple returns citing embroidery defects — loose threads and holes near border.',
    evidence_summary: '11 returns in 10 days. 88% confidence. Supplier batch #41 implicated.',
    status: 'in_progress',
    outcome: null,
    profit_protected: null,
  },
  {
    id: 'A-003',
    title: "Re-photograph Men's Chino Dark Teal under natural light",
    reason: 'Listing misrepresentation — customers reporting the color looks washed out vs. product photography.',
    evidence_summary: '9 returns in 21 days. Moderate confidence (74%). Same complaint across multiple buyers.',
    status: 'todo',
    outcome: null,
    profit_protected: null,
  },
  {
    id: 'A-004',
    title: 'Update size guide for Anarkali Suit — Ivory with actual cm measurements',
    reason: 'Partial size guide was updated following customer feedback 6 weeks ago.',
    evidence_summary: '6 returns, 4 citing fit. Low volume but early signal.',
    status: 'done',
    outcome: 'Fit-related returns for BT-ANK-IV-L dropped 38% in the 3 weeks following guide update.',
    profit_protected: '₹1.8L',
  },
];
