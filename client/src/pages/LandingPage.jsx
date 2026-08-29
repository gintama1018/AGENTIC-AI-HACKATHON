import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Shield, CheckCircle2, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Badge } from '../components/ui/Badge';

const REAL_CASES = [
  {
    id: 'RS-1042',
    product: 'Kurta Set — Sage Green (M)',
    sku: 'BT-KRS-SG-M',
    customerVoice: '"I ordered medium like I always do but it fits like a small. The chest area is really tight. Returning it. Please fix the sizing."',
    detectedReason: 'Size & Fit Mismatch',
    inference: 'Batch #2024-Q3 sizing specification deviated from historical charts by −2.5 cm on bust/chest measurements.',
    confidence: 'High · 91%',
    relatedCount: 17,
    relatedWindow: '14 days',
    action: 'Audit size measurements for BT-KRS-SG-M batch #2024-Q3. Update size guide with actual cm measurements before next campaign.',
    city: 'Jaipur, Rajasthan',
    logistic: 'Delhivery Reverse Logistic',
    amount: '₹1,890',
  },
  {
    id: 'RS-0887',
    product: "Men's Chino — Dark Teal (32)",
    sku: 'BT-CHN-DT-32',
    customerVoice: '"The color in the photo looked much darker and richer. What arrived is faded-looking, almost washed out. Very disappointed. Returning."',
    detectedReason: 'Listing & Color Variance',
    inference: 'Color rendering gap between studio photography (5500K saturated lighting) and delivered product under natural indoor lighting.',
    confidence: 'Moderate · 74%',
    relatedCount: 9,
    relatedWindow: '21 days',
    action: 'Re-photograph BT-CHN-DT-32 under natural daylight without saturation enhancement. Add written color swatch description to listing.',
    city: 'Bengaluru, Karnataka',
    logistic: 'BlueDart Express Reverse',
    amount: '₹2,150',
  },
  {
    id: 'RS-1118',
    product: 'Embroidered Dupatta — Rust',
    sku: 'BT-DPT-RS-OS',
    customerVoice: '"Got the package today — the dupatta has a loose thread and two small holes near the border embroidery. Clearly a quality issue. Requesting full refund."',
    detectedReason: 'Quality / Manufacturing Defect',
    inference: 'Embroidery finishing defect in supplier loom batch #41. Linked to high-speed loom tension settings causing border perforation.',
    confidence: 'High · 88%',
    relatedCount: 11,
    relatedWindow: '10 days',
    action: 'Halt dispatch of batch #41. Initiate QC audit with Surat loom vendor. Expedite replacement stock from secondary vendor.',
    city: 'Ahmedabad, Gujarat',
    logistic: 'Shadowfax Reverse',
    amount: '₹880',
  },
];

export const LandingPage = () => {
  const [activeCase, setActiveCase] = useState(0);
  const selected = REAL_CASES[activeCase];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans">
      <Navbar />

      {/* ── Opening Statement ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 border-b border-slate-800/80">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/60 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>n8n Orchestrated · Gemini Return Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            Returns are not just losses.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
              They are evidence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            ReturnShield transforms unstructured return feedback from Indian D2C orders into actionable root-cause diagnoses — diagnosing defective batches before they trigger thousands in RTO courier penalties.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/login" className="rs-btn-primary" style={{ height: 44, padding: '0 20px', fontSize: 14 }}>
              Open Live Workstation <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="rs-btn-secondary" style={{ height: 44, padding: '0 20px', fontSize: 14 }}>
              Explore Evidence Chain <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 01: The Signal ──────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 space-y-8 border-b border-slate-800/80">
        <div className="space-y-2">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">01 — The Signal</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Every return begins with a raw customer statement
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Most brands refund and forget. ReturnShield captures the verbatim customer voice, parses emotional signal, and extracts exact product defect parameters.
          </p>
        </div>

        {/* Case selector buttons */}
        <div className="flex flex-wrap gap-2">
          {REAL_CASES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(i)}
              className={[
                'px-4 py-2 text-xs font-bold rounded-lg border transition-all',
                activeCase === i
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700',
              ].join(' ')}
            >
              Case {c.id}: {c.product.split('—')[0]}
            </button>
          ))}
        </div>

        {/* Case inspection card */}
        <div className="grid md:grid-cols-2 gap-0 border border-slate-800 rounded-2xl overflow-hidden bg-[#111827] shadow-xl">
          {/* Left: Raw signal */}
          <div className="p-6 sm:p-8 space-y-5 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0D121F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Ingested Evidence</span>
              <span className="text-xs font-num font-bold text-emerald-400">{selected.amount}</span>
            </div>

            <div>
              <p className="text-sm font-bold text-white">{selected.product}</p>
              <p className="text-xs font-num text-slate-400 mt-0.5">SKU: {selected.sku} · {selected.city}</p>
            </div>

            <blockquote className="text-sm text-slate-200 italic leading-relaxed border-l-2 border-indigo-500 pl-4 py-2 bg-slate-900/80 rounded-r-lg">
              {selected.customerVoice}
            </blockquote>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Logistics: {selected.logistic}</span>
              <span className="font-num text-indigo-300 font-semibold">{selected.id}</span>
            </div>
          </div>

          {/* Right: AI reasoning chain */}
          <div className="p-6 sm:p-8 space-y-5 bg-[#111827]">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</span>
              <p className="text-base font-extrabold text-white">{selected.detectedReason}</p>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Inferred Operational Root Cause</span>
              <p className="text-xs text-slate-300 leading-relaxed">{selected.inference}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Model Confidence</span>
              <Badge variant="success">{selected.confidence}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02: Pattern & Action ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-8 border-b border-slate-800/80">
        <div className="space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">02 — The Pattern & Intervention</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Connecting dots into high-impact operational decisions
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Single returns look accidental. Clustered across orders, they reveal vendor discrepancies, sizing matrix errors, and studio lighting mismatches.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recurrence Signal</span>
              <Badge variant="attention">Surging Pattern</Badge>
            </div>
            <p className="text-xl font-bold text-white">{selected.detectedReason} Cluster</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 font-num">{selected.relatedCount} identical returns</strong> logged across {selected.relatedWindow} on this SKU family.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Prescribed Action</span>
              <span className="text-xs font-num text-slate-400">Target Resolution: 48h</span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">{selected.action}</p>
            <div className="pt-2">
              <Link to="/login" className="rs-btn-primary text-xs">
                Launch Live Workstation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#0D121F] to-[#080C14] border-t border-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop losing 20–30% of your D2C GMV to return blindspots.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Test the live workstation pre-configured with 50+ real Indian return records for BharatThreads Lifestyle Pvt. Ltd.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link to="/login" className="rs-btn-primary" style={{ height: 44, padding: '0 24px', fontSize: 14 }}>
              1-Click Demo Access (Sonu Jangir) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
