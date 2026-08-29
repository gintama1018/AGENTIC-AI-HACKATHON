import React from 'react';

/**
 * DESIGN.md §13 — Status indicators: text-first with tiny semantic dot.
 * Never bright colored pills.
 *
 * variant: 'default' | 'attention' | 'success' | 'critical' | 'muted'
 */
const variants = {
  default:   { dot: 'bg-graphite', text: 'text-graphite' },
  attention: { dot: 'bg-attention', text: 'text-attention' },
  success:   { dot: 'bg-success',   text: 'text-success'   },
  critical:  { dot: 'bg-critical',  text: 'text-critical'  },
  muted:     { dot: 'bg-ash',       text: 'text-ash'       },
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const { dot, text } = variants[variant] || variants.default;
  return (
    <span className={`rs-status ${text} ${className}`}>
      <span className={`rs-status-dot ${dot}`} />
      {children}
    </span>
  );
};

export default Badge;
