# ReturnShield AI

> **Operational Return & RTO Intelligence Platform powered by Multi-Agent n8n Workflows, Google Gemini 3.1 Flash Lite, and a Resilient Deterministic Fallback Engine.**

[![Architecture: Multi-Agent System](https://img.shields.io/badge/Architecture-n8n%20Multi--Agent%20%2B%20Express%20%2B%20React-6366F1.svg)](https://github.com/gintama1018/AGENTIC-AI-HACKATHON)
[![Model: Google Gemini 3.1 Flash Lite](https://img.shields.io/badge/Model-Gemini%203.1%20Flash%20Lite-0ea5e9.svg)](https://deepmind.google/technologies/gemini/)
[![Design: Editorial Dark Workstation](https://img.shields.io/badge/UI-Editorial%20Operations%20Workstation-10B981.svg)](DESIGN.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6.svg)](LICENSE)

---

## Table of Contents
- [Executive Summary](#executive-summary)
- [Problem & Context](#problem--context)
- [System Architecture](#system-architecture)
- [Agentic Workflow Implementation](#agentic-workflow-implementation)
- [Resilience & Deterministic Fallback Engine](#resilience--deterministic-fallback-engine)
- [Workstation Interface](#workstation-interface)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Testing & Validation](#testing--validation)
- [Architectural Disclosures & Tradeoffs](#architectural-disclosures--tradeoffs)
- [API Reference](#api-reference)
- [Team / Credits](#team--credits)
- [License](#license)

---

## Executive Summary

**ReturnShield AI** is an operational return and RTO (Return to Origin) investigation platform built for Indian D2C e-commerce brands. Instead of relying on a single prompt or displaying retrospective aggregate charts, ReturnShield routes return datasets through a **3-tier multi-agent pipeline orchestrated on n8n** with Google Gemini 3.1 Flash Lite. 

When network or API restrictions prevent reaching cloud agents, a **server-side deterministic fallback engine** executes mathematical concentration uplift formulas, sample-size sufficiency checks (`MIN_SAMPLE >= 5`), and heuristic categorization without downtime.

---

## Problem & Context

E-commerce fashion and lifestyle brands in India experience significant margin erosion:
- **Customer Returns (15–25%)**: Driven by sizing inconsistencies across vendor lots, fabric defects, and catalog representation mismatches.
- **RTO / Delivery Failures (20–40% on COD)**: Driven by fake delivery attempts, customer unreachability at doorsteps, and courier serviceability deficits in tier-2/3 pincodes.

Most existing dashboards conflate RTO with product returns and compute aggregate percentages even when baseline order counts are missing. ReturnShield separates these two distinct failure modes at the ingestion boundary.

---

## System Architecture

```text
[ Raw CSV / API Ingest ]
         │
         ▼
[ Express Ingestion Controller ]
  • Header alias resolution (25+ variations)
  • 5,000-row demo safety guard
  • Return vs. RTO derivation
         │
         ├─── (Primary: Cloud Webhook) ───► [ n8n Cloud Workflow 1 ]
         │                                    • Data Quality & Metric Audit
         │                                    • Gemini Multilingual Classifier
         │                                    • Cross-Dimension Uplift Matrix
         │                                    • Competing Hypotheses Synthesizer
         │                                    • 6-Check Deterministic Self-Verifier
         │
         └─── (Fallback: Network Down) ───► [ Local Deterministic Fallback ]
                                              • Mathematical Uplift Ratio Calculation
                                              • Rule-Based Hinglish Pattern Matcher
                                              • Sample-Gated Hypotheses Generator
                                              • Verification & Drift Delta Engine
         │
         ▼
[ Canonical Normalizer (normalizeAnalysis) ]
  • Single internal contract mapping
  • Zero synthetic string/number fallbacks
  • Explicit metadata: intelligence_source ("n8n" | "fallback")
         │
         ▼
[ Local Document Store (db.json) ] ──► [ React Vite Workstation ]
  • runs[], analyses[], recommendations[]       • Overview Briefing
  • interventions[], feedback[]                 • Problem SKU Profiles
                                                • Ask ReturnShield (Workflow 2 Tools)
                                                • Actions Hub & Feedback Loop (Workflow 3)
```

---

## Agentic Workflow Implementation

### Workflow 1: Main Return Intelligence Pipeline (`returns-agent`)
- **28-node workflow** deployed on n8n.
- **Gemini Reason Classifier**: Classifies English and Hinglish customer comments (*"chhota hai"*, *"delivery boy nahi aaya"*).
- **Concentration Uplift Matrix**: Computes uplift ratios against baseline expected distributions:
  $$\text{Uplift} = \frac{\text{Segment Share of Returns}}{\text{Segment Share of Total Orders}}$$
- **Hypothesis Engine**: Produces 1–3 competing explanations per hotspot with supporting evidence and recommended verification tests.
- **Self-Verification Engine**: Deterministic post-LLM validation that demotes model overclaims, checks traceability, and enforces human approval.

### Workflow 2: Ask ReturnShield Conversational Agent (`returnshield-ask`)
- Interactive agent equipped with **6 LangChain Code Tools**:
  1. `get_segment_metrics`: Computes return/RTO counts and order value for dimension values.
  2. `get_reason_distribution`: Categorical complaint frequency and percentage shares.
  3. `get_top_problems`: Ranked problem clusters with sample sufficiency flags.
  4. `get_recommendations`: Operational action items and measurement plans.
  5. `compare_to_previous_run`: Longitudinal trend deltas between successive runs.
  6. `get_hypotheses`: Competing root-cause pairs and test actions.

### Workflow 3: Closed-Loop Intervention & Feedback (`returnshield-feedback`)
- Captures operator approvals for prescribed actions (e.g. COD OTP verification, sizing chart updates).
- Records intervention records with baseline metrics, target thresholds, and audit metadata (`recorded_by`, timestamp).

---

## Resilience & Deterministic Fallback Engine

ReturnShield implements a fully verified failure path in `server/src/services/aiEngine.js`:
- If the n8n webhook returns a 4xx/5xx status code or times out, the backend executes `runLocalDeterministicAnalysis()`.
- Computes mathematical uplift ratios directly from the ingested dataset.
- Evaluates sample-size sufficiency (`count >= 5`).
- Labels the response with `intelligence_source: "fallback"` and `tools_used: ["local_run_context"]`.

---

## Workstation Interface

| View | Component | Description |
|---|---|---|
| **Overview** | `OverviewPage.jsx` | Operational briefing narrative, live `run_id`, self-verification status badge, and competing hypothesis cards. |
| **Returns** | `ReturnsPage.jsx` | High-contrast returns investigation table with search, category filtering, and return details modal. |
| **Patterns** | `PatternsPage.jsx` | Longitudinal multi-week trajectory analysis and category trend lines. |
| **Problem SKUs** | `ProductsPage.jsx` | Problem SKU case files detailing return volume, dominant complaint type, and customer feedback. |
| **Actions Hub** | `RecommendationsPage.jsx` | Prescribed interventions with 1-click **Approve Intervention** flow, baseline metrics, and target plans. |
| **Ask Drawer** | `AskReturnShieldDrawer.jsx` | Tool-using AI assistant displaying exact LangChain tool execution badges (`[get_segment_metrics, get_top_problems]`). |
| **Import** | `ImportPage.jsx` | 5-stage drag-and-drop CSV ingestion with 1-click sample batch loader. |

---

## Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/gintama1018/AGENTIC-AI-HACKATHON.git
cd AGENTIC-AI-HACKATHON

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
```

### Environment Configuration

In `server/.env` (see `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_key_here
N8N_WEBHOOK_SECRET=your_n8n_webhook_secret_here

# Optional: Remote n8n webhooks (uses local fallback if offline)
N8N_ANALYSIS_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/returns-agent
N8N_FOLLOWUP_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/returnshield-ask
N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/returnshield-feedback
```

### Running Locally

```bash
# Terminal 1: Backend Server (http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Workstation (http://localhost:5173)
cd client
npm run dev
```

---

## Testing & Validation

### Automated Strict Assertion Test Suite

To run the automated verification suite validating all 3 workflows:

```bash
cd server
node test_live_e2e_suite.js
```

### Frontend Production Build Validation

```bash
cd client
npm run build
```

---

## Architectural Disclosures & Tradeoffs

To ensure complete transparency during technical evaluation:

1. **Persistent Document Store (`db.json`)**:
   - *Current Design*: A flat JSON file store managed by `server/src/config/db.js` for zero-setup hackathon portability.
   - *Tradeoff*: Rewritten on updates; suitable for demo and prototype workloads. Production deployment requires migration to PostgreSQL / Supabase with row-level locking.

2. **Deterministic Fallback Engine (`aiEngine.js`)**:
   - *Current Design*: Uses keyword heuristic pattern matching across English and Hinglish terms when the primary LLM agent is offline.
   - *Tradeoff*: Heuristic matching is rule-based and lacks the generative nuances of Gemini 3.1 Flash Lite; it serves as a resilient, zero-downtime safety net.

3. **Rate Gating & Metric Honesty**:
   - If a merchant CSV export does not contain total shipped order summaries, return percentage rates are disabled (`ratesAvailable: false`), and only absolute counts and within-dataset shares are presented to avoid ungrounded percentage claims.

4. **Row Ingestion Guard (5,000 Rows)**:
   - Payloads larger than 5,000 rows are capped during CSV parsing to prevent request timeouts in serverless / containerized demo environments.

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and n8n webhook connectivity. |
| `POST` | `/api/returns/import` | Ingests return batches, executes Workflow 1 (or fallback), persists run. |
| `GET` | `/api/returns` | Returns list with pagination, search, and category filters. |
| `GET` | `/api/analytics/overview` | Executive briefing metrics derived from verified run state. |
| `GET` | `/api/analytics/patterns` | Longitudinal trajectory data across complaint categories. |
| `GET` | `/api/analytics/products` | Problem SKU profiles with return rates and feedback signals. |
| `POST` | `/api/ask` | Conversational query routed to Workflow 2 Ask Agent with tool execution. |
| `GET` | `/api/recommendations` | List of prescribed operational actions with measurement plans. |
| `POST` | `/api/recommendations/:id/approve` | Records human approval and logs intervention into Workflow 3. |

---

## Team / Credits

- **Sonu Jangir** — *Lead Full-Stack Architect & AI Systems Engineer*  
  - Email: [Sonu.jangir2024@uem.edu.in](mailto:Sonu.jangir2024@uem.edu.in)
  - GitHub: [@gintama1018](https://github.com/gintama1018)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
