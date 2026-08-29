import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080C14]/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-sm text-white tracking-tight block">ReturnShield</span>
            <span className="text-[10px] text-slate-400 font-medium">Return Intelligence</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#how-it-works"   className="hover:text-white transition-colors">How It Works</a>
          <a href="#evidence-demo"  className="hover:text-white transition-colors">Evidence Chain</a>
          <a href="#architecture"   className="hover:text-white transition-colors">n8n Pipeline</a>
        </nav>

        {/* CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="rs-btn-primary text-xs">
              Open Workstation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-2">
                Sign In
              </Link>
              <Link to="/login" className="rs-btn-primary text-xs">
                Launch Demo Workstation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D121F] border-b border-slate-800 px-6 py-4 space-y-3 text-xs">
          <a href="#how-it-works"  onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white">How It Works</a>
          <a href="#evidence-demo" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white">Evidence Chain</a>
          <a href="#architecture"  onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-white">n8n Pipeline</a>
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-xs font-semibold text-slate-300 bg-slate-800 rounded-lg border border-slate-700">Sign In</Link>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg">Launch Demo</Link>
          </div>
        </div>
      )}
    </header>
  );
};
