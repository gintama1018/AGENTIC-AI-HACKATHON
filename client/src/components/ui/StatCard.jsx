import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * DESIGN.md §4.2 — Numeric Emphasis: 22-28px tabular numerals.
 * §14 — Cards only for distinct content objects, surface background, stone border.
 * §2.2 — Decisions before metrics: every stat must have a label + context line.
 *
 * props:
 *   label       — string, what the number represents
 *   value       — string|number
 *   unit        — optional prefix/suffix (e.g. '₹', '%')
 *   unitPos     — 'before' | 'after' (default 'before')
 *   context     — one-line interpretation of what this number means
 *   trend       — 'up' | 'down' | 'flat' | null
 *   trendValue  — string (e.g. '+12% vs last week')
 *   trendGood   — boolean (is 'up' good or bad for this metric?)
 */
export const StatCard = ({
  label,
  value,
  unit = '',
  unitPos = 'before',
  context,
  trend,
  trendValue,
  trendGood = false,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'flat' ? 'text-ash' :
    (trend === 'up' && trendGood) || (trend === 'down' && !trendGood)
      ? 'text-success'
      : 'text-attention';

  return (
    <div className="rs-card">
      {/* Label */}
      <p className="text-meta text-graphite mb-2">{label}</p>

      {/* Value */}
      <p className="font-num text-charcoal font-semibold leading-none mb-2" style={{ fontSize: 26 }}>
        {unitPos === 'before' && unit && <span className="text-[18px] font-normal text-graphite mr-0.5">{unit}</span>}
        {value}
        {unitPos === 'after' && unit && <span className="text-[18px] font-normal text-graphite ml-0.5">{unit}</span>}
      </p>

      {/* Trend */}
      {trend && trendValue && (
        <p className={`flex items-center gap-1 text-meta mb-2 ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          {trendValue}
        </p>
      )}

      {/* Context interpretation */}
      {context && (
        <p className="text-meta text-graphite border-t border-mist pt-2 mt-2">{context}</p>
      )}
    </div>
  );
};

export default StatCard;
