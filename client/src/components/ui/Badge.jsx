import React from 'react';

const variants = {
  default:   { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-200', dot: 'bg-slate-400' },
  attention: { bg: 'bg-amber-950/60', border: 'border-amber-700/60', text: 'text-amber-300', dot: 'bg-amber-400' },
  success:   { bg: 'bg-emerald-950/60', border: 'border-emerald-700/60', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  critical:  { bg: 'bg-rose-950/60', border: 'border-rose-700/60', text: 'text-rose-300', dot: 'bg-rose-400' },
  info:      { bg: 'bg-indigo-950/60', border: 'border-indigo-700/60', text: 'text-indigo-300', dot: 'bg-indigo-400' },
  muted:     { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-400', dot: 'bg-slate-500' },
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const v = variants[variant] || variants.default;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v.bg} ${v.border} ${v.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {children}
    </span>
  );
};

export default Badge;
