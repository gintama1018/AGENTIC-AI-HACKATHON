import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Sparkles, LayoutDashboard, Menu, X, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 p-0.5 shadow-glow flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                ReturnShield<span className="text-brand-400">.AI</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Autonomous Return & RTO Defense
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#interactive-demo" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" /> Live AI Engine
          </a>
          <a href="#calculator" className="hover:text-white transition-colors">ROI Calculator</a>
          <a href="#architecture" className="hover:text-white transition-colors">n8n Engine</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow transition-all"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link
              to="/dashboard"
              className="p-2 text-brand-400 rounded-lg hover:bg-slate-800"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 p-4 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50"
          >
            Features
          </a>
          <a
            href="#interactive-demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50"
          >
            Live AI Engine Demo
          </a>
          <a
            href="#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50"
          >
            ROI Calculator
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50"
          >
            n8n System Architecture
          </a>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full text-center py-2 text-sm text-slate-300 hover:text-white rounded-lg bg-slate-800/80"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
