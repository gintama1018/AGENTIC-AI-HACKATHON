import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-stone">
      <div className="max-w-workstation mx-auto px-8 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-control bg-ink flex items-center justify-center">
            <Shield className="w-4 h-4 text-surface" />
          </div>
          <span className="font-semibold text-[15px] text-charcoal tracking-tight">ReturnShield</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-compact text-graphite">
          <a href="#how-it-works"   className="hover:text-charcoal transition-colors">How it works</a>
          <a href="#evidence-demo"  className="hover:text-charcoal transition-colors">Investigation sandbox</a>
          <a href="#architecture"   className="hover:text-charcoal transition-colors">Architecture</a>
        </nav>

        {/* CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="rs-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
              Open Workstation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-compact text-graphite hover:text-charcoal transition-colors">
                Sign in
              </Link>
              <Link to="/login" className="rs-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
                Open demo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-control text-graphite hover:text-charcoal hover:bg-canvas transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-b border-stone px-6 py-4 space-y-3 text-compact">
          <a href="#how-it-works"  onClick={() => setMobileOpen(false)} className="block text-graphite hover:text-charcoal">How it works</a>
          <a href="#evidence-demo" onClick={() => setMobileOpen(false)} className="block text-graphite hover:text-charcoal">Investigation sandbox</a>
          <a href="#architecture"  onClick={() => setMobileOpen(false)} className="block text-graphite hover:text-charcoal">Architecture</a>
          <div className="pt-3 border-t border-mist flex gap-2">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-compact text-graphite border border-stone rounded-btn">Sign in</Link>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-compact font-semibold text-surface bg-ink rounded-btn">Open demo</Link>
          </div>
        </div>
      )}
    </header>
  );
};
