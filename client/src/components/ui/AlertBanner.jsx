import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertBanner = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const isWarning = alert.type === 'warning' || alert.severity === 'high';

  return (
    <div className={`p-4 rounded-xl mb-6 border transition-all ${
      isWarning 
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
        : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
    } flex items-start justify-between gap-4`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
          {isWarning ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{alert.title}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AI Action Alert
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link 
          to="/dashboard/recommendations" 
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
        >
          View Recommendations <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
