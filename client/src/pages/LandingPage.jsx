import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Database, 
  Zap, 
  BarChart3, 
  DollarSign, 
  Cpu, 
  Activity, 
  Package, 
  FileText, 
  Check, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const LandingPage = () => {
  // Interactive Live AI Demo state
  const demoSamples = [
    {
      title: "Denim Sizing Mismatch",
      comment: "Ordered a Large but fits like a tight Medium. Can't button the chest comfortably when wearing a light shirt.",
      product: "Vintage Heavyweight Denim Jacket",
      reason: "Size too small"
    },
    {
      title: "Broken Headphone Hinge",
      comment: "Left earbud stopped charging after 4 days and the plastic headband snapped on light expansion.",
      product: "ProSound ANC Wireless Headphones",
      reason: "Defective hardware"
    },
    {
      title: "Studio Lighting Hue Delta",
      comment: "Color is totally different from the photo. Website shows deep navy blue, actual dress is dusty grey-teal.",
      product: "Silk Slip Midi Dress",
      reason: "Color not as pictured"
    },
    {
      title: "Crushed Fragile Package",
      comment: "Box arrived crushed in courier transit, glass dripper was shattered inside padded envelope.",
      product: "Ceramic Pour-Over Coffee Dripper",
      reason: "Damaged delivery"
    }
  ];

  const [selectedSample, setSelectedSample] = useState(demoSamples[0]);
  const [customComment, setCustomComment] = useState(demoSamples[0].comment);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState({
    category: "Size & Fit Mismatch",
    confidence: "96.4%",
    rootCause: "Garment pattern chest circumference runs 2.2 inches tighter than standard US/EU measurement spec.",
    recommendedAction: "Add high-visibility 'Runs Small — Size Up' advisory on PDP and calibrate measurement matrix with vendor.",
    severity: "High"
  });

  // Interactive ROI Calculator State
  const [monthlyOrders, setMonthlyOrders] = useState(6000);
  const [currentReturnRate, setCurrentReturnRate] = useState(24);
  const [avgOrderValue, setAvgOrderValue] = useState(75);

  const monthlyReturns = Math.round((monthlyOrders * currentReturnRate) / 100);
  const estimatedCostPerReturn = Math.round(avgOrderValue * 0.32 + 8.50); // freight + handling + markdown
  const totalMonthlyLoss = monthlyReturns * estimatedCostPerReturn;
  const estimatedShieldSavings = Math.round(totalMonthlyLoss * 0.38); // 38% returns reduction via root cause fixes

  const handleRunLiveAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const text = customComment.toLowerCase();
      let cat = 'Size & Fit Mismatch';
      let conf = '96.2%';
      let cause = 'Garment pattern dimensions run 1.5 - 2 inches smaller than standard specification.';
      let act = 'Add prominent "Runs Small" banner on PDP and adjust size measurement matrix.';
      let sev = 'High';

      if (text.includes('broken') || text.includes('snap') || text.includes('defect') || text.includes('charge')) {
        cat = 'Quality / Manufacturing Defect';
        conf = '98.5%';
        cause = 'Component hardware fatigue failure under low tensile load during initial usage cycles.';
        act = 'Quarantine supplier batch and mandate tensile shear testing before dispatch.';
        sev = 'Critical';
      } else if (text.includes('color') || text.includes('photo') || text.includes('picture') || text.includes('different')) {
        cat = 'Listing & Color Variance';
        conf = '93.8%';
        cause = 'Studio strobe illumination oversaturated RGB highlights creating 18% hue delta.';
        act = 'Re-shoot imagery under 5000K neutral daylight and add customer unboxing swatch photos.';
        sev = 'Medium';
      } else if (text.includes('crush') || text.includes('transit') || text.includes('courier') || text.includes('box')) {
        cat = 'Logistics & Transit Damage';
        conf = '97.1%';
        cause = 'Single-wall corrugate packaging insufficient for courier conveyor drop forces.';
        act = 'Upgrade carton specification to 200# Mullen double-wall with molded pulp inserts.';
        sev = 'High';
      }

      setAiOutput({ category: cat, confidence: conf, rootCause: cause, recommendedAction: act, severity: sev });
      setAnalyzing(false);
    }, 450);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-600/20 via-indigo-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Gen Autonomous Reverse Logistics Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
              Stop bleeding profit from <br className="hidden sm:block" />
              <span className="text-gradient-brand">silent recurring returns</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              ReturnShield AI sits on top of your n8n workflow to transform unstructured customer return comments into persistent root-cause diagnostics, problem product leaderboards, and automated return prevention.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow transition-all group"
              >
                Launch Live Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl glass-card text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                1-Click Demo Sign In
              </Link>
            </div>

            {/* Proof Points */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Persistent Cross-Time Database
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> n8n Webhook + Built-in NLP
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero-Config Quick Setup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live AI Engine Demo Section */}
      <section id="interactive-demo" className="py-16 bg-[#0E1424] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Interactive Preview</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Test The AI Diagnostic Engine In Real-Time
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Select a customer return scenario or write your own raw complaint to see how ReturnShield AI extracts precise engineering root-causes and actionable fixes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Column */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Scenarios</p>
              <div className="grid grid-cols-2 gap-2">
                {demoSamples.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSample(s);
                      setCustomComment(s.comment);
                    }}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                      selectedSample.title === s.title
                        ? 'bg-brand-600/20 border-brand-500/50 text-white font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Raw Customer Return Comment / Voice
                </label>
                <textarea
                  rows={4}
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  placeholder="e.g. The jacket was way too tight across the shoulders and the zipper jammed..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900/90 rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <button
                onClick={handleRunLiveAnalysis}
                disabled={analyzing || !customComment}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-glow transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                {analyzing ? 'Synthesizing Root Cause...' : 'Run Autonomous Diagnosis'}
              </button>
            </div>

            {/* AI Output Column */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 border-brand-500/30 relative overflow-hidden space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Diagnostic Output</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  Confidence: {aiOutput.confidence}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Classified Category</p>
                  <p className="text-sm font-bold text-indigo-300 mt-0.5">{aiOutput.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Priority Severity</p>
                  <span className="inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {aiOutput.severity} Priority
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Cpu className="w-4 h-4" /> Diagnosed Engineering Root Cause:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {aiOutput.rootCause}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" /> AI Prescribed Corrective Action:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {aiOutput.recommendedAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Savings Calculator */}
      <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Financial Impact</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Calculate How Much Return Revenue You Can Recover
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every return costs an average of 30% of item value + $8.50 in reverse logistics and restocking freight.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-700/70 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Monthly Order Volume</span>
                <span className="text-brand-400 font-mono">{monthlyOrders.toLocaleString()} orders</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Current Return / RTO Rate</span>
                <span className="text-rose-400 font-mono">{currentReturnRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={currentReturnRate}
                onChange={(e) => setCurrentReturnRate(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Average Order Value (AOV)</span>
                <span className="text-emerald-400 font-mono">${avgOrderValue}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-emerald-950/30 border border-indigo-500/30 space-y-4 text-center">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Estimated Monthly Profit Recovered</p>
            <div className="text-4xl sm:text-5xl font-extrabold text-gradient-emerald">
              ${estimatedShieldSavings.toLocaleString()}
              <span className="text-sm font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on preventing <span className="text-white font-bold">{Math.round(monthlyReturns * 0.38)}</span> returns each month by resolving recurring sizing, photo variance, and supplier defects.
            </p>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>Annual Savings:</span>
              <span className="font-bold text-emerald-400 font-mono">${(estimatedShieldSavings * 12).toLocaleString()} / year</span>
            </div>

            <Link
              to="/signup"
              className="block w-full py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all mt-2"
            >
              Start Recovering Lost Revenue
            </Link>
          </div>
        </div>
      </section>

      {/* System Architecture Flow Diagram */}
      <section id="architecture" className="py-16 bg-[#0E1424] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Under The Hood</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Engineered On Top Of ReturnShield AI v2 n8n Workflow
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Persistent history across uploads closes the one critical loop in pure webhook pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="glass-card rounded-2xl p-5 border border-slate-700/60 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mb-3">1</div>
              <h3 className="text-sm font-bold text-white mb-1">CSV & API Ingestion</h3>
              <p className="text-xs text-slate-400">Upload returns via bulk CSV, direct manual entry, or API webhooks.</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-700/60 relative">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center mb-3">2</div>
              <h3 className="text-sm font-bold text-white mb-1">n8n AI Pipeline Dispatch</h3>
              <p className="text-xs text-slate-400">Batches dispatch to n8n: normalize → classify → root-cause → priority score.</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-700/60 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mb-3">3</div>
              <h3 className="text-sm font-bold text-white mb-1">Persistent DB Upsert</h3>
              <p className="text-xs text-slate-400">Stores historical data in MongoDB / JSON to detect multi-week recurring patterns.</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-700/60 relative">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mb-3">4</div>
              <h3 className="text-sm font-bold text-white mb-1">Action Hub & ROI Tracking</h3>
              <p className="text-xs text-slate-400">Teams track recommendations to closure and measure verified reduction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Flexible Plans</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Built For Fast-Growing E-Commerce Brands
          </h2>
          <p className="text-sm text-slate-400 mt-2">Zero lock-in. Free tier friendly for hackathons and startups.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Starter</h3>
            <p className="text-xs text-slate-400">For boutique stores up to 500 returns/mo</p>
            <div className="text-3xl font-bold text-white">$0 <span className="text-xs font-normal text-slate-400">/ hackathon demo</span></div>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Full AI Root Cause Engine</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> CSV Drag & Drop Import</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> n8n Webhook Integration</li>
            </ul>
            <Link to="/signup" className="block text-center py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-700">
              Get Started Free
            </Link>
          </div>

          {/* Growth */}
          <div className="glass-card rounded-2xl p-6 border-2 border-brand-500 relative space-y-4 shadow-glow">
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-brand-600 text-[10px] font-bold text-white">
              Most Popular
            </div>
            <h3 className="text-base font-bold text-white">Growth</h3>
            <p className="text-xs text-slate-400">For active DTC apparel & electronics</p>
            <div className="text-3xl font-bold text-white">$149 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Returns Processing</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Cross-Time Pattern Analytics</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Problem Product Leaderboard</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Executive PDF/CSV Reports</li>
            </ul>
            <Link to="/signup" className="block text-center py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Enterprise</h3>
            <p className="text-xs text-slate-400">For multi-brand retailers & 3PLs</p>
            <div className="text-3xl font-bold text-white">Custom</div>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated n8n Instance</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom Warehouse ERP Sync</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Multi-Tenant Role Access</li>
            </ul>
            <Link to="/signup" className="block text-center py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-700">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border-brand-500/40 relative overflow-hidden bg-gradient-to-br from-brand-950/60 via-slate-900 to-indigo-950/60">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to eliminate recurring returns?
            </h2>
            <p className="text-sm text-slate-300">
              Access the live platform with pre-loaded demo data in under 5 seconds.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200"
              >
                1-Click Demo Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
