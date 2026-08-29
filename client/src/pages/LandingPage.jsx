import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// DESIGN.md §29 — Landing page as a product story, not a template
// Structure: Signal → Interpretation → Pattern → Action → Outcome

const REAL_CASES = [
  {
    id: 'RS-1042',
    product: 'Kurta Set — Sage Green (M)',
    sku: 'BT-KRS-SG-M',
    customerVoice: '"I ordered medium like I always do but it fits like a small. The chest area is really tight. Returning it. Please fix the sizing."',
    detectedReason: 'Fit / Sizing',
    inference: 'Size inconsistency in latest production batch — medium cut appears to have deviated from historical measurements.',
    confidence: 'High · 91%',
    relatedCount: 17,
    relatedWindow: '14 days',
    action: 'Audit size measurements for BT-KRS-SG-M batch #2024-Q3. Update size guide with actual cm measurements before next campaign.',
    city: 'Jaipur',
    logistic: 'Delhivery reverse',
    amount: '₹1,890',
  },
  {
    id: 'RS-0887',
    product: 'Men\'s Chino — Dark Teal (32)',
    sku: 'BT-CHN-DT-32',
    customerVoice: '"The color in the photo looked much darker and richer. What arrived is faded-looking, almost washed out. Very disappointed. Returning."',
    detectedReason: 'Product misrepresentation',
    inference: 'Color rendering gap between studio photography and delivered product — product photography may be using colour correction that overstates saturation.',
    confidence: 'Moderate · 74%',
    relatedCount: 9,
    relatedWindow: '21 days',
    action: 'Re-photograph BT-CHN-DT-32 under natural light without saturation enhancement. Add written color description to listing.',
    city: 'Bengaluru',
    logistic: 'BlueDart reverse',
    amount: '₹2,150',
  },
  {
    id: 'RS-1118',
    product: 'Embroidered Dupatta — Rust',
    sku: 'BT-DPT-RS-OS',
    customerVoice: '"Got the package today — the dupatta has a loose thread and two small holes near the border embroidery. Clearly a quality issue. Requesting full refund."',
    detectedReason: 'Damaged / defective item',
    inference: 'Embroidery finishing defect in supplier batch BT-DPT-RS batch #41. Likely linked to high-speed loom settings causing thread tension issues.',
    confidence: 'High · 88%',
    relatedCount: 11,
    relatedWindow: '10 days',
    action: 'Halt dispatch of batch #41. Initiate QC audit with supplier. Expedite replacement stock from secondary vendor.',
    city: 'Ahmedabad',
    logistic: 'Shadowfax reverse',
    amount: '₹880',
  },
];

export const LandingPage = () => {
  const [activeCase, setActiveCase] = useState(0);
  const selected = REAL_CASES[activeCase];

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      {/* ── Opening statement ───────────────────────────────────── */}
      <section className="max-w-workstation mx-auto px-8 pt-20 pb-16 border-b border-stone">
        <div className="max-w-2xl">
          <p className="text-meta text-ash uppercase tracking-widest mb-6">ReturnShield — Return Investigation System</p>
          <h1 className="font-serif-editorial text-charcoal mb-5" style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.035em' }}>
            Returns are not just losses.<br />They are evidence.
          </h1>
          <p className="text-body text-graphite max-w-xl mb-8" style={{ lineHeight: 1.65 }}>
            ReturnShield turns fragmented return signals from Indian D2C e-commerce teams into patterns they can investigate and act on — before the same product ships another defective batch.
          </p>
          <div className="flex items-center gap-3">
            <a href="#how-it-works" className="rs-btn-primary">
              See how it works <ArrowDown className="w-4 h-4" />
            </a>
            <Link to="/login" className="rs-btn-secondary">
              Open demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── §29 Story: 01 — The Signal ─────────────────────────── */}
      <section id="how-it-works" className="max-w-workstation mx-auto px-8 pt-16 pb-10">
        <p className="text-meta text-ash uppercase tracking-widest mb-3">01 — The Signal</p>
        <h2 className="text-[20px] font-semibold text-charcoal mb-2">
          A customer return is a raw signal
        </h2>
        <p className="text-compact text-graphite mb-8 max-w-xl">
          Every return comes with a customer comment. Most teams file it, refund it, and move on. ReturnShield treats it as the beginning of an investigation.
        </p>

        {/* Case selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {REAL_CASES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(i)}
              className={[
                'px-3 py-1.5 text-compact rounded-control border transition-colors',
                activeCase === i
                  ? 'bg-charcoal text-surface border-charcoal font-semibold'
                  : 'bg-surface text-graphite border-stone hover:border-charcoal hover:text-charcoal',
              ].join(' ')}
            >
              {c.id}
            </button>
          ))}
        </div>

        {/* Case display */}
        <div className="grid md:grid-cols-2 gap-0 border border-stone rounded-card overflow-hidden">
          {/* Left: raw signal */}
          <div className="bg-surface px-6 py-6 border-r border-stone">
            <p className="text-meta text-ash mb-3 uppercase tracking-wider">Raw customer signal</p>
            <div className="mb-4">
              <p className="text-meta text-graphite mb-0.5">{selected.product}</p>
              <p className="text-meta font-num text-ash">{selected.sku} · {selected.amount} · {selected.city}</p>
            </div>
            <blockquote className="text-body text-charcoal leading-relaxed border-l-2 border-stone pl-4" style={{ fontStyle: 'italic' }}>
              {selected.customerVoice}
            </blockquote>
            <div className="mt-4 pt-4 border-t border-mist flex items-center justify-between text-meta text-ash">
              <span>Return ID: {selected.id}</span>
              <span>{selected.logistic}</span>
            </div>
          </div>

          {/* Right: interpretation chain */}
          <div className="bg-canvas px-6 py-6 space-y-5">
            <div>
              <p className="text-meta text-ash mb-1">Detected reason</p>
              <p className="text-compact font-semibold text-charcoal">{selected.detectedReason}</p>
            </div>

            <div className="border-t border-mist pt-5">
              <p className="text-meta text-ash mb-1">Likely cause <span className="text-ash italic">(inferred)</span></p>
              <p className="text-compact text-charcoal leading-relaxed">{selected.inference}</p>
            </div>

            <div className="border-t border-mist pt-5">
              <p className="text-meta text-ash mb-1">Classification confidence</p>
              <p className="text-compact font-semibold text-charcoal">{selected.confidence}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── §29 Story: 02 — The Pattern ────────────────────────── */}
      <section className="max-w-workstation mx-auto px-8 pt-10 pb-10">
        <p className="text-meta text-ash uppercase tracking-widest mb-3">02 — The Pattern</p>
        <h2 className="text-[20px] font-semibold text-charcoal mb-2">
          One return is a complaint. Seventeen is a pattern.
        </h2>
        <p className="text-compact text-graphite mb-6 max-w-xl">
          ReturnShield connects individual return signals across time, product variants, and customer segments to surface recurring root causes that teams would otherwise miss.
        </p>

        <div className="border border-stone rounded-card bg-surface px-6 py-5">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div>
              <p className="text-compact font-semibold text-charcoal">{selected.detectedReason} — {selected.product}</p>
              <p className="text-compact text-graphite mt-0.5">
                <span className="font-num font-semibold text-charcoal">{selected.relatedCount}</span> similar returns in the last {selected.relatedWindow}
              </p>
            </div>
            <span className="text-meta text-ash flex-shrink-0 pt-0.5">Pattern detected</span>
          </div>

          {/* Minimal visual pattern bar */}
          <div className="space-y-2">
            {[
              { label: 'Week –3', pct: 8  },
              { label: 'Week –2', pct: 22 },
              { label: 'Week –1', pct: 58 },
              { label: 'This week', pct: 100 },
            ].map(({ label, pct }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-meta text-ash w-16 flex-shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-mist rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-charcoal transition-all duration-300"
                    style={{ width: `${pct}%`, opacity: pct === 100 ? 1 : 0.3 + (pct / 100) * 0.5 }}
                  />
                </div>
                <span className="text-meta font-num text-graphite w-6 text-right">{Math.round(pct / 100 * selected.relatedCount)}</span>
              </div>
            ))}
          </div>
          <p className="text-meta text-graphite mt-4 pt-4 border-t border-mist">
            {selected.detectedReason} returns accelerated this week. Most cite the same issue across multiple orders.
          </p>
        </div>
      </section>

      {/* ── §29 Story: 03 — The Action ─────────────────────────── */}
      <section className="max-w-workstation mx-auto px-8 pt-10 pb-10">
        <p className="text-meta text-ash uppercase tracking-widest mb-3">03 — The Action</p>
        <h2 className="text-[20px] font-semibold text-charcoal mb-2">
          From pattern to operational decision
        </h2>
        <p className="text-compact text-graphite mb-6 max-w-xl">
          ReturnShield prescribes a specific operational action based on the detected root cause — not a generic suggestion.
        </p>

        <div className="border border-stone rounded-card bg-surface divide-y divide-mist">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-meta text-ash uppercase tracking-wider">Prescribed action</p>
              <span className="rs-status text-ash"><span className="rs-status-dot bg-ash" /> To do</span>
            </div>
            <p className="text-compact text-charcoal leading-relaxed mt-2">{selected.action}</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-meta text-ash mb-1">Evidence</p>
            <p className="text-compact text-graphite">{selected.relatedCount} returns citing {selected.detectedReason.toLowerCase()} in {selected.relatedWindow}.</p>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <p className="text-meta text-ash">Outcome tracked after implementation</p>
            <Link to="/login" className="rs-btn-primary" style={{ height: 34, padding: '0 14px', fontSize: 13 }}>
              See in workstation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── §29 Story: 04 — The Outcome ────────────────────────── */}
      <section className="max-w-workstation mx-auto px-8 pt-10 pb-16 border-b border-stone">
        <p className="text-meta text-ash uppercase tracking-widest mb-3">04 — The Outcome</p>
        <h2 className="text-[20px] font-semibold text-charcoal mb-2">
          Close the loop after you act
        </h2>
        <p className="text-compact text-graphite mb-8 max-w-xl">
          After an action is taken, ReturnShield tracks whether the return rate for that pattern actually declined — so you can confirm what worked.
        </p>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { stat: '−38%', label: 'Return rate reduction', context: 'After size guide update for Kurta Set batch, fit-related returns dropped within 3 weeks.' },
            { stat: '₹4.2L', label: 'Verified profit protected', context: 'Across 6 closed actions in the last 60 days for BharatThreads.' },
            { stat: '11 days', label: 'Mean time to action', context: 'From first signal detection to team acting on a recommended intervention.' },
          ].map(({ stat, label, context }) => (
            <div key={label} className="rs-card">
              <p className="font-num text-charcoal font-semibold mb-1" style={{ fontSize: 26 }}>{stat}</p>
              <p className="text-compact font-semibold text-charcoal mb-2">{label}</p>
              <p className="text-meta text-graphite">{context}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture ───────────────────────────────────────── */}
      <section id="architecture" className="max-w-workstation mx-auto px-8 pt-16 pb-16">
        <p className="text-meta text-ash uppercase tracking-widest mb-3">System architecture</p>
        <h2 className="text-[20px] font-semibold text-charcoal mb-2">
          Agentic pipeline — not a black box
        </h2>
        <p className="text-compact text-graphite mb-8 max-w-xl">
          Every analysis step is traceable. The system is built on n8n orchestration with Gemini classification — and the interface shows you exactly what was detected, what was inferred, and how confident the system is.
        </p>

        {/* Pipeline steps */}
        <div className="space-y-0 border border-stone rounded-card overflow-hidden">
          {[
            { step: '01', label: 'Return ingested', detail: 'CSV upload, Shopify webhook, or manual entry via the Import pipeline.' },
            { step: '02', label: 'n8n orchestrator triggered', detail: 'Workflow initiates classification, entity extraction, and pattern matching.' },
            { step: '03', label: 'Gemini classifies return reason', detail: 'Customer comment classified into reason category with confidence score.' },
            { step: '04', label: 'Pattern engine checks history', detail: 'Classification compared against previous 90 days of return signals for the same SKU family.' },
            { step: '05', label: 'Root cause inferred', detail: 'System surfaces likely operational cause — clearly labelled as inference, not fact.' },
            { step: '06', label: 'Action prescribed', detail: 'Specific recommended action written to the Actions queue for team review.' },
            { step: '07', label: 'Outcome tracked', detail: 'After action is marked Done, return rate monitored to verify impact.' },
          ].map(({ step, label, detail }, i, arr) => (
            <div key={step} className={`flex gap-5 px-5 py-4 bg-surface ${i < arr.length - 1 ? 'border-b border-mist' : ''}`}>
              <span className="font-num text-meta text-ash w-6 flex-shrink-0 pt-0.5">{step}</span>
              <div>
                <p className="text-compact font-semibold text-charcoal">{label}</p>
                <p className="text-meta text-graphite mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="bg-surface border-t border-stone">
        <div className="max-w-workstation mx-auto px-8 py-16">
          <div className="max-w-lg">
            <h2 className="text-[24px] font-semibold text-charcoal tracking-tight mb-3">
              Ready to investigate your returns?
            </h2>
            <p className="text-compact text-graphite mb-6">
              Open the demo workstation with pre-seeded Indian D2C return data for BharatThreads Lifestyle Pvt. Ltd.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/login" className="rs-btn-primary">
                Open demo workstation <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/signup" className="rs-btn-secondary">
                Register brand
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
