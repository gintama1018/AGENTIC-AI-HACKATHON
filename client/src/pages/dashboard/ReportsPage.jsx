import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Package,
  Calendar,
  Building
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ReportsPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [ov, fin, prd] = await Promise.all([
          api.getOverviewAnalytics(),
          api.getFinancialImpact(),
          api.getProductAnalytics()
        ]);
        setOverview(ov);
        setFinancial(fin);
        setProducts(prd.data || []);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header (hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Intelligence Report</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            C-level summary of reverse-logistics loss, root causes, and return reduction initiatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-8 bg-[#0E1424]">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-400" />
              <span className="text-lg font-extrabold text-white">ReturnShield AI Intelligence Brief</span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Reverse Logistics & Defect Analysis</p>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <p className="font-bold text-white">{user?.company_name || 'Aurora Apparel & Goods'}</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p className="font-mono text-[10px] text-brand-400">Report ID: RPT-2026-{Math.floor(1000 + Math.random() * 9000)}</p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Returns Analyzed</p>
            <p className="text-2xl font-extrabold text-white mt-1">{overview?.metrics?.totalReturns || 0}</p>
            <p className="text-[10px] text-slate-500">Across 30-day reporting window</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Return Loss</p>
            <p className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
              ${(overview?.metrics?.totalFinancialLoss || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">Reverse logistics & markdowns</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Projected Recoverable Profit</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              ${(financial?.potentialSavings || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-400/80 font-semibold">With AI mitigation steps</p>
          </div>
        </div>

        {/* Financial Cost Drivers */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Reverse Logistics Cost Drivers Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {(financial?.costDrivers || []).map((driver, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">{driver.name}</p>
                  <p className="text-[10px] text-slate-400">Avg {driver.avgPerReturn} per return</p>
                </div>
                <span className="font-mono font-bold text-white text-sm">{driver.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Problem SKUs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            High Priority Defect SKUs (Action Required)
          </h3>
          <div className="space-y-2 text-xs">
            {products.slice(0, 3).map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-400">{p.product_id}</span>
                    <span className="font-bold text-white">{p.product_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Primary Driver: <span className="text-amber-300 font-semibold">{p.top_reason}</span> • Return Rate: <span className="text-rose-400 font-semibold">{p.return_rate}%</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-300">${p.estimated_financial_loss} Loss</span>
                  <p className="text-[10px] text-slate-500">Priority Score: {p.priority_score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off footer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Prepared by ReturnShield AI Engine v2</span>
          <span>Confidential — Internal Operations Use</span>
        </div>
      </div>
    </div>
  );
};
