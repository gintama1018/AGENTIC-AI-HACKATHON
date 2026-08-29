import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-surface border-t border-stone mt-16">
    <div className="max-w-workstation mx-auto px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-control bg-ink flex items-center justify-center">
          <Shield className="w-3 h-3 text-surface" />
        </div>
        <span className="text-compact font-semibold text-charcoal">ReturnShield</span>
      </div>

      <p className="text-meta text-ash">
        Return investigation and action system for Indian D2C e-commerce teams.
      </p>

      <div className="flex items-center gap-5 text-meta text-graphite">
        <Link to="/login"      className="hover:text-charcoal transition-colors">Sign in</Link>
        <Link to="/dashboard"  className="hover:text-charcoal transition-colors">Workstation</Link>
        <a href="#how-it-works" className="hover:text-charcoal transition-colors">How it works</a>
      </div>
    </div>

    <div className="border-t border-mist">
      <div className="max-w-workstation mx-auto px-8 py-4 flex items-center justify-between text-meta text-ash">
        <span>BharatThreads Lifestyle Pvt. Ltd. — Powered by n8n + Gemini</span>
        <span>Agentic AI Hackathon 2026</span>
      </div>
    </div>
  </footer>
);
