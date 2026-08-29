# ReturnShield AI — Website Build Plan (v1)

## 0. Scope Assumption
This plan assumes the website is **not just a landing page** — it's the actual
product frontend that sits on top of your existing n8n workflow
("ReturnShield AI v2"). Users log in, feed return data in, and see AI-driven
insights come back. This also fixes the one real gap in the current n8n
build: **no persistent history = no real cross-time pattern detection.**
Adding your own DB here solves that.

If you actually just wanted a marketing/demo page for the hackathon
submission, tell me — the plan below shrinks a lot (basically just Page 1
and Page 9 stay, everything else drops).

---

## 1. Tech Stack Decision (with reasoning)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React (Vite)** | Dashboard has tables, charts, filters, live state — plain HTML/JS will turn into spaghetti fast. Vite = fast dev, easy deploy. |
| Styling | **Tailwind CSS** | Fast to build clean UI solo, no fighting CSS files |
| Charts | **Recharts** | Simple, React-native, enough for trend/priority charts |
| Backend | **Node.js + Express** | You already think in JS (n8n uses JS expressions), keeps one language across stack |
| Database | **MongoDB (Atlas free tier)** | Returns data is semi-structured (varying fields per store), Mongo's flexible schema fits better than forcing rigid SQL tables. If you specifically want heavy SQL analytics later, Postgres is the alt — but for MVP, Mongo is faster to ship. |
| Auth | **JWT + bcrypt** (or Firebase Auth if you want to skip building this) | Simple, no extra infra needed |
| AI Engine | **Your existing n8n workflow (unchanged)** | Backend calls the n8n webhook — you don't rebuild the AI logic, just wrap it |
| Hosting | Frontend → **Vercel**, Backend → **Render/Railway**, DB → **MongoDB Atlas free tier**, n8n → **n8n Cloud free tier or self-host** | All free-tier friendly for a student project |

**Not HTML-only** — because you need routing, state, and reusable table/chart
components. Plain HTML would mean rewriting DOM manipulation by hand for
every dashboard update.

---

## 2. Page List (13 pages/routes)

### Public
1. `/` — Landing page (problem, solution, demo CTA, screenshots)
2. `/login`
3. `/signup`
4. `*` — 404 page

### Authenticated (Dashboard)
5. `/dashboard` — Overview: total returns, top reason, RTO %, trending alert banner
6. `/dashboard/returns` — Table of all returns (filter by reason/product/date/status)
7. `/dashboard/returns/:id` — Single return detail: raw comment, AI reason tag, root cause, confidence
8. `/dashboard/patterns` — Trend charts over time (reasons rising/falling, weekly comparison)
9. `/dashboard/products` — Problem-product leaderboard, priority score, return rate
10. `/dashboard/recommendations` — AI-suggested actions list, mark as done/in-progress
11. `/dashboard/import` — Upload CSV of returns OR manual entry form (triggers pipeline)
12. `/dashboard/settings` — Manage n8n webhook URL, Google Sheets ID, API keys, team/company info
13. `/dashboard/reports` — Export summary as PDF/CSV (optional, phase 2)

---

## 3. User Flow (End to End)

```
1. User signs up → creates "company" profile
2. User goes to /dashboard/import
   → uploads CSV of returns (or connects live via API key)
3. Backend saves raw returns → DB (status: "pending_analysis")
4. Backend batches returns → POST to your n8n webhook (ReturnShield AI v2)
5. n8n pipeline runs (unchanged): normalize → validate → analytics →
   classify → merge → root-cause → priority → recommend → JSON out
6. n8n responds → Backend receives JSON → writes results back into DB:
   - per-return: reason, root cause, confidence
   - per-product: priority score, return rate (upserted/aggregated)
   - recommendations: inserted as actionable items
7. Dashboard auto-refreshes → user sees:
   - Overview KPIs (/dashboard)
   - Individual return reasoning (/dashboard/returns/:id)
   - Trend patterns ACROSS ALL past uploads, not just this batch (/dashboard/patterns)
   - Problem products ranked (/dashboard/products)
   - Action items to reduce future returns (/dashboard/recommendations)
8. User marks recommendations as implemented → tracked over time
```

**Key fix vs current n8n-only setup:** step 6 persists everything to a real
DB, so `/dashboard/patterns` can show trends across *weeks/months* of
uploads — not just whatever was in the last webhook call.

---

## 4. System Design (High-Level)

```
┌─────────────┐      REST API       ┌──────────────────┐
│  React SPA  │ ◄─────────────────► │  Node/Express API │
│  (Vercel)   │       (JWT auth)    │     (Render)       │
└─────────────┘                     └─────────┬─────────┘
                                               │
                     ┌─────────────────────────┼───────────────────────┐
                     │                         │                       │
              ┌──────▼──────┐         ┌────────▼────────┐     ┌────────▼────────┐
              │  MongoDB     │         │  n8n Webhook     │     │  Job Queue       │
              │  (Atlas)     │         │  (ReturnShield   │     │  (optional,      │
              │  users,      │         │   AI v2 engine)  │     │  BullMQ+Redis,   │
              │  returns,    │         │  unchanged        │     │  for big batches)│
              │  products,   │         └──────────────────┘     └──────────────────┘
              │  recs        │
              └──────────────┘
```

**Important design call:** for large CSV uploads (say 500+ returns), don't
call n8n synchronously and make the user wait on an HTTP request. Instead:
backend queues the batch → processes async → n8n calls back a
`/api/webhook/results` endpoint on your backend when done → frontend polls
or uses a "processing..." status until results land. For small hackathon
demo batches (<50 rows) synchronous is fine — this is a phase 2 concern.

---

## 5. Backend API Routes

```
POST   /api/auth/signup
POST   /api/auth/login

POST   /api/returns/import          (CSV upload / manual bulk entry)
GET    /api/returns                 (list, with filters)
GET    /api/returns/:id

GET    /api/analytics/overview      (KPIs for dashboard home)
GET    /api/analytics/patterns      (trend data over time)
GET    /api/analytics/products      (problem-product leaderboard)

GET    /api/recommendations
PATCH  /api/recommendations/:id     (mark done/in-progress)

GET    /api/settings/integration
PUT    /api/settings/integration    (update n8n webhook URL, sheet ID etc.)

POST   /api/webhook/results         (n8n calls this back with AI output)
```

---

## 6. Database Schema (MongoDB collections)

```
users
  _id, name, email, password_hash, company_name, created_at

returns
  _id, user_id, order_id, product_id, product_name,
  customer_comment, return_reason_raw,
  ai_reason_category, ai_confidence, ai_root_cause,
  status ("pending" | "analyzed"), return_date, created_at

product_stats
  _id, user_id, product_id, product_name,
  total_returns, return_rate, priority_score, last_updated

recommendations
  _id, user_id, product_id (nullable), text, priority,
  status ("todo" | "in_progress" | "done"), created_at

integrations
  _id, user_id, n8n_webhook_url, google_sheet_id, api_key, created_at
```

`product_stats` gets **upserted** (not overwritten) on every batch — this is
what makes cross-time pattern detection actually real, instead of
per-execution only.

---

## 7. MVP Build Order (do it in this sequence)

1. Auth (signup/login) + basic layout shell
2. `/dashboard/import` + returns collection + CSV parsing
3. Backend → n8n webhook call → store results back (this is the core loop, get it working end-to-end first with 5 dummy rows before building more UI)
4. `/dashboard/returns` + `/dashboard/returns/:id`
5. `/dashboard` overview KPIs
6. `/dashboard/products` (priority leaderboard)
7. `/dashboard/patterns` (trend charts — needs a few days/batches of data to actually look good, so seed with sample data for demo)
8. `/dashboard/recommendations`
9. `/dashboard/settings`
10. Landing page (do this LAST — polish it once the product actually works)

---

## 8. What This Fixes From the n8n-Only Version

- Adds **persistent history** → real recurring-pattern detection across time, not just per-batch
- Adds **auth + multi-tenant** → multiple e-commerce teams can use it, not just one webhook caller
- Adds **status tracking on recommendations** → closes the loop (did the action actually reduce returns?)
- n8n workflow itself stays **completely unchanged** — it's still the AI brain, this just wraps a real product around it
