import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070A12] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                ReturnShield<span className="text-brand-400">.AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              The autonomous reverse-logistics intelligence layer for modern e-commerce. Turning customer return chaos into persistent root-cause diagnostics, supplier accountability, and automated return prevention.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-mono pt-2">
              <Sparkles className="w-3.5 h-3.5" /> Powered by n8n Workflow + Autonomous AI Engine
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Overview Dashboard</Link></li>
              <li><Link to="/dashboard/returns" className="hover:text-white transition-colors">Returns Diagnostic Explorer</Link></li>
              <li><Link to="/dashboard/patterns" className="hover:text-white transition-colors">Cross-Time Trend Analytics</Link></li>
              <li><Link to="/dashboard/products" className="hover:text-white transition-colors">Product Priority Leaderboard</Link></li>
              <li><Link to="/dashboard/recommendations" className="hover:text-white transition-colors">AI Action Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Hackathon & Tech</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-300">Stack: React + Vite + Tailwind</li>
              <li className="text-slate-300">Backend: Node + Express + Mongo/JSON</li>
              <li className="text-slate-300">AI Engine: ReturnShield AI v2 (n8n)</li>
              <li className="text-slate-300">Charts: Recharts Visualizer</li>
              <li><Link to="/dashboard/settings" className="hover:text-white text-indigo-400">Integration Webhook Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            © 2026 ReturnShield AI Platform. Built for the Agentic AI Hackathon.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Persistent Cross-Time DB</span>
            <span>•</span>
            <span>Multi-Tenant Auth</span>
            <span>•</span>
            <span>Zero-Config Execution</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
