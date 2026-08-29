import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * DESIGN.md §03 — Attention: burnt orange #A45636 on soft #F0E0D7
 * No neon, no glassmorphism.
 */
export const AlertBanner = ({ message, linkLabel, linkTo, onDismiss }) => (
  <div
    className="flex items-start justify-between gap-3 px-4 py-3 rounded-surface border"
    style={{
      backgroundColor: '#F0E0D7',
      borderColor: '#D4906E',
    }}
  >
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#A45636' }} />
      <div className="text-compact" style={{ color: '#7A3D21' }}>
        {message}
        {linkTo && linkLabel && (
          <>
            {' '}
            <Link to={linkTo} className="font-semibold underline underline-offset-2 hover:opacity-75 transition-opacity">
              {linkLabel}
            </Link>
          </>
        )}
      </div>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="p-0.5 rounded transition-colors flex-shrink-0" style={{ color: '#A45636' }}>
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

export default AlertBanner;
