import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-[#0D121F] border-t border-slate-800 mt-20">
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-white block">ReturnShield</span>
          <span className="text-[11px] text-slate-400">Return Intelligence System</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 max-w-md">
        Automated return investigation and action engine designed for Indian D2C brands.
      </p>

      <div className="flex items-center gap-6 text-xs text-slate-400 font-semibold">
        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
        <Link to="/dashboard" className="hover:text-white transition-colors">Workstation</Link>
        <a href="#how-it-works" className="hover:text-white transition-colors">Documentation</a>
      </div>
    </div>

    <div className="border-t border-slate-800/80 bg-[#080C14]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span>BharatThreads Lifestyle Pvt. Ltd. · Sonu Jangir (gintama1018)</span>
        <span>Agentic AI Hackathon 2026</span>
      </div>
    </div>
  </footer>
);
