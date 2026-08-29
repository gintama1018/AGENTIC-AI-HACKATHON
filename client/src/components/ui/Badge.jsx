import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const base = "inline-flex items-center font-medium rounded-full border transition-colors";
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  const variants = {
    default: "bg-slate-800/80 text-slate-300 border-slate-700",
    brand: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    // Reason category mappings
    'Size & Fit Mismatch': "bg-amber-500/15 text-amber-300 border-amber-500/30",
    'Quality / Manufacturing Defect': "bg-rose-500/15 text-rose-300 border-rose-500/30",
    'Listing & Color Variance': "bg-purple-500/15 text-purple-300 border-purple-500/30",
    'Logistics & Transit Damage': "bg-orange-500/15 text-orange-300 border-orange-500/30",
    'Warehouse Fulfillment Error': "bg-blue-500/15 text-blue-300 border-blue-500/30",
    'Buyer Remorse / Intent Shift': "bg-slate-500/15 text-slate-300 border-slate-500/30",
    // Severity
    critical: "bg-rose-600/20 text-rose-400 border-rose-600/40 font-semibold",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-slate-700/40 text-slate-400 border-slate-700"
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`${base} ${sizeStyles[size] || sizeStyles.md} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};
