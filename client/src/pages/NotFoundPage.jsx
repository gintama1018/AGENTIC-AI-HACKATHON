import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-6xl font-extrabold text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The route you requested does not exist or has been moved.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-500 shadow-glow"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl glass-card text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
};
