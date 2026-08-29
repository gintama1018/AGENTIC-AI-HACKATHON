import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * DESIGN.md §09 — Shadows only for drawers/modals.
 * Surface: #FCFAF6, border: #D8D2C8, shadow: rgba(28,27,25,0.08)
 */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28, 27, 25, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rs-surface rounded-card w-full"
        style={{
          maxWidth,
          boxShadow: '0 8px 28px rgba(28, 27, 25, 0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mist">
          <h2 className="text-subsection text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-control text-ash hover:text-charcoal hover:bg-canvas transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
