import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral'
  trendLabel = '',
  gradient = 'from-indigo-500/20 to-purple-500/10',
  iconColor = 'text-indigo-400',
  badgeText = ''
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      {/* Background Accent Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {title}
            {badgeText && (
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
                {badgeText}
              </span>
            )}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center ${iconColor} shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Footer / Trend Info */}
      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs relative z-10">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 font-semibold ${
                trendDirection === 'down' ? 'text-emerald-400' :
                trendDirection === 'up' ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                {trend}
              </span>
              <span className="text-slate-400">{trendLabel}</span>
            </div>
          ) : (
            <span className="text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
