# 🛡️ ReturnShield AI — Autonomous Return & RTO Defense Platform

> **Transform unstructured e-commerce return chaos into persistent root-cause diagnostics, problem product leaderboards, and automated return prevention.**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![n8n Integration](https://img.shields.io/badge/AI%20Pipeline-n8n%20Workflow%20v2-ea4b71.svg)](https://n8n.io/)
[![Persistence](https://img.shields.io/badge/DB-MongoDB%20%2F%20Persistent%20JSON-10b981.svg)](https://www.mongodb.com/)

---

## 📌 Executive Summary

Traditional e-commerce stores lose **20% to 35% of their revenue** through recurring customer returns and Return-To-Origin (RTO) failures. Pure webhook-only AI automations suffer from a critical limitation: **without persistent cross-time data storage, they cannot detect recurring patterns across multi-week batches or track whether implemented corrective actions actually reduced return rates.**

**ReturnShield AI** solves this by wrapping an intelligent multi-tenant web application around the **n8n AI Engine ("ReturnShield AI v2")**, persisting return history across time, calculating dynamic **Product Priority Scores**, and closing the feedback loop with actionable recommendation tracking.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Frontend Client (React 18 + Vite + Tailwind)"]
        Landing["Landing Page & Live AI Demo (/)"]
        AuthPages["Auth: Login & Signup (/login, /signup)"]
        Dashboard["Overview Dashboard (/dashboard)"]
        Explorer["Returns Explorer & Diagnostic Modal (/dashboard/returns)"]
        Detail["Single Return Diagnostic View (/dashboard/returns/:id)"]
        Patterns["Cross-Time Trend Patterns (/dashboard/patterns)"]
        Products["Problem Products Leaderboard (/dashboard/products)"]
        Recs["AI Action Hub & Recs (/dashboard/recommendations)"]
        Import["CSV & Manual Data Studio (/dashboard/import)"]
        Settings["Integrations & n8n Config (/dashboard/settings)"]
        Reports["Executive Intelligence Brief (/dashboard/reports)"]
    end

    subgraph APILayer ["Backend REST API (Node.js + Express)"]
        AuthCtrl["Auth Controller & JWT Auth"]
        ReturnsCtrl["Returns Controller & CSV Parser"]
        AnalyticsCtrl["Analytics & Trajectory Engine"]
        RecsCtrl["Recommendations Manager"]
        SettingsCtrl["Integrations & Webhook Ping Tool"]
        WebhookCtrl["Async Webhook Callback (/api/webhook/results)"]
    end

    subgraph DataLayer ["Persistence Engine"]
        MongoStore[("MongoDB Atlas Database")]
        LocalStore[("Zero-Config Persistent Engine (db.json)")]
    end

    subgraph AIEngine ["Dual Intelligence Layer"]
        N8NWebhook["External n8n AI Pipeline (ReturnShield AI v2)"]
        BuiltinNLP["Integrated NLP Taxonomy & Diagnostic Engine"]
    end

    ClientLayer -->|REST API / JWT| APILayer
    APILayer -->|Read / Write / Upsert| MongoStore
    APILayer -->|Fallback Atomic Persistence| LocalStore
    APILayer -->|Batch Dispatch| N8NWebhook
    APILayer -->|Autonomous Fallback Processing| BuiltinNLP
    N8NWebhook -.->|Async Results Callback| WebhookCtrl
```

---

## 🔄 End-to-End Data Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    actor Merchant as E-Commerce Merchant
    participant UI as ReturnShield Web SPA
    participant Server as Express Backend
    participant DB as Persistent Database
    participant AI as n8n AI Engine (or Local Fallback)

    Merchant->>UI: Uploads Return CSV (or submits manual return)
    UI->>Server: POST /api/returns/import (Multi-tenant)
    Server->>DB: Save raw return records (status: pending_analysis)
    Server->>AI: POST batch payload to n8n Webhook
    AI->>AI: Normalize → Extract Sentiment → Classify → Root-Cause Diagnosis
    AI-->>Server: Return classified JSON payload
    Server->>DB: Upsert analyzed diagnostics & recalculate product stats
    Server->>DB: Generate smart corrective action recommendations
    Server-->>UI: Live response with refreshed KPIs & trajectories
    Merchant->>UI: Reviews /dashboard/patterns & implements recommendations
    Merchant->>UI: Marks action as "Resolved" → tracks profit recovered
```

---

## 🧠 Dual AI Engine Architecture

ReturnShield AI features a **dual-engine architecture** ensuring 100% operational uptime:

1. **n8n Workflow Connector (`ReturnShield AI v2`)**:
   - Dispatches return batches to external n8n workflows configured in `/dashboard/settings`.
   - Supports asynchronous callback via `POST /api/webhook/results`.
   - Includes a built-in **"Test Connection"** ping tool measuring round-trip network latency.

2. **Built-in NLP Taxonomy & Diagnostic Engine**:
   - Runs automatically when external n8n instances are offline or in local demo mode.
   - Categorizes return comments into 6 distinct root-cause categories:
     - 📐 `Size & Fit Mismatch`
     - ⚙️ `Quality / Manufacturing Defect`
     - 🎨 `Listing & Color Variance`
     - 📦 `Logistics & Transit Damage`
     - 🏷️ `Warehouse Fulfillment Error`
     - 💡 `Buyer Remorse / Intent Shift`
   - Generates precise engineering root causes and prescribed supplier/listing mitigations.

---

## 🗄️ Database Schema & Collections

| Collection | Key Fields | Description |
|---|---|---|
| `users` | `_id`, `name`, `email`, `password_hash`, `company_name`, `role`, `created_at` | Multi-tenant tenant accounts |
| `returns` | `_id`, `user_id`, `order_id`, `customer_name`, `product_id`, `product_name`, `product_price`, `customer_comment`, `return_reason_raw`, `ai_reason_category`, `ai_confidence`, `ai_root_cause`, `ai_mitigation_fix`, `severity`, `status`, `return_date` | Granular return records with full AI diagnostics |
| `product_stats` | `_id`, `product_id`, `product_name`, `category`, `total_returns`, `return_rate`, `priority_score`, `estimated_financial_loss`, `top_reason`, `last_updated` | **Cross-time aggregated SKU statistics** (upserted across uploads) |
| `recommendations` | `_id`, `rule_key`, `product_id`, `product_name`, `text`, `category`, `priority`, `estimated_savings`, `status` (`todo` \| `in_progress` \| `done`), `created_at`, `resolved_at` | Actionable items tracked to closure |
| `integrations` | `_id`, `user_id`, `n8n_webhook_url`, `google_sheet_id`, `api_key`, `sync_interval`, `auto_analyze` | Webhook endpoints and external keys |

---

## 📱 Page & Feature Guide (All 13 Routes)

### Public Pages
- **`/` — Landing Page**:
  - **Interactive Live AI Demo Widget**: Test raw customer complaints against the AI classifier with real-time root-cause synthesis.
  - **Interactive ROI Cost Savings Calculator**: Dynamic sliders to estimate recoverable profit based on monthly orders, return rate, and AOV.
  - **Architecture Flow & Feature Breakdown**.
  - **Pricing Tiers & FAQ**.
- **`/login` — Sign In Page**:
  - Email/password authentication + **1-Click Demo Login button** for instant evaluation as `Sarah Jenkins (Aurora Apparel)`.
- **`/signup` — Tenant Registration**:
  - Create custom brand workspaces with multi-tenant data isolation.
- **`*` — 404 Page**:
  - Custom error page with navigational recovery links.

### Authenticated Dashboard Routes
- **`/dashboard` — Overview Hub**:
  - Metric cards: Total Returns, RTO Rate %, Net Financial Loss ($), AI Diagnostic Confidence (95%), Active Recommendations.
  - Urgent Alert Banner for surging failure modes.
  - 14-day interactive Area Trend Chart (Daily Returns vs Fit Issues vs Defects).
  - Donut chart of AI Reason Distribution.
  - Top 4 Problem Products snapshot and live recent returns stream.
- **`/dashboard/returns` — Returns Diagnostic Explorer**:
  - Searchable and filterable data table (by Reason, Severity, Product, Date).
  - **CSV Bulk Export** with full diagnostic metadata.
  - **Quick-View Modal** to inspect root-causes without leaving the table.
- **`/dashboard/returns/:id` — Single Return Diagnostic**:
  - Customer verbatim comment, AI confidence meter, and defect severity rating.
  - Diagnosed engineering root-cause and prescribed action.
  - **Related recurring returns for the same SKU** demonstrating multi-order patterns across time.
- **`/dashboard/patterns` — Cross-Time Trend Patterns**:
  - 4-week longitudinal trajectory charts.
  - Week-over-Week shift radar identifying **Surging**, **Declining**, and **Stable** return drivers.
  - Root-cause clustering breakdown across products.
- **`/dashboard/products` — Problem Products Leaderboard**:
  - SKUs ranked by dynamic **Priority Score** (`Return Rate × Volume × Financial Loss`).
  - Drill-down modal with primary failure mode analysis and supplier action plans.
- **`/dashboard/recommendations` — AI Action Hub**:
  - Corrective actions ranked by priority (Critical, High, Medium).
  - Status management (`To Do`, `In Progress`, `Resolved / Done`) to close the loop.
  - Real-time potential vs realized savings tally ($).
- **`/dashboard/import` — Data Ingestion Studio**:
  - Drag-and-drop CSV batch uploader.
  - **1-Click "Download Sample CSV Template"**.
  - **1-Click "Load Pre-Configured Demo Returns"** (50+ records).
  - Manual single return submission form with immediate live AI classification.
- **`/dashboard/settings` — Integrations & n8n Manager**:
  - n8n Webhook URL manager with live **"Test Connection" ping tool** measuring latency.
  - Google Sheets integration and API key management.
- **`/dashboard/reports` — Executive Intelligence Brief**:
  - Printable C-level summary report with reverse logistics cost driver breakdown and ROI projections.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **Framework**: React 18 (SPA) with Vite
- **Styling**: Tailwind CSS (Dark Glassmorphism design system)
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM v6

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File & CSV Processing**: Multer & csv-parser
- **HTTP Client**: Axios
- **Persistence**: MongoDB Atlas + Atomic JSON local persistent engine fallback

---

## ⚡ Quick Start & Local Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/gintama1018/AGENTIC-AI-HACKATHON.git
cd AGENTIC-AI-HACKATHON
```

### 2. Install Dependencies
```bash
npm run install:all
```
*(Or install individually: `cd server && npm install && cd ../client && npm install`)*

### 3. Start the Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run server:dev

# Terminal 2: Start Frontend App (Port 5173)
npm run client
```

### 4. Access the Application
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Instant Login**: Click the **"1-Click Demo Login"** button on the sign-in page!

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Sign in (or 1-click demo login) |
| `POST` | `/api/auth/signup` | Register new tenant profile |
| `GET` | `/api/auth/me` | Fetch authenticated session |
| `GET` | `/api/returns` | List returns (supports search, category, severity, pagination) |
| `GET` | `/api/returns/:id` | Get deep-dive return diagnostic by ID |
| `POST` | `/api/returns/import` | Upload CSV batch or JSON returns array |
| `POST` | `/api/returns/single` | Submit single return with instant AI classification |
| `POST` | `/api/returns/seed-demo` | Seed 50+ pre-configured 4-week demo returns |
| `GET` | `/api/analytics/overview` | Fetch overview KPIs, timeline, and reason distribution |
| `GET` | `/api/analytics/patterns` | Fetch 4-week category trajectories and root-cause clusters |
| `GET` | `/api/analytics/products` | Fetch problem-product priority leaderboard |
| `GET` | `/api/analytics/financial-impact` | Fetch reverse logistics cost breakdown & savings |
| `GET` | `/api/recommendations` | List AI recommendations with summary metrics |
| `PATCH` | `/api/recommendations/:id` | Update recommendation status (`todo`, `in_progress`, `done`) |
| `POST` | `/api/recommendations` | Log custom operations initiative |
| `GET` | `/api/settings/integration` | Fetch n8n webhook and Google Sheet configs |
| `PUT` | `/api/settings/integration` | Update integration settings |
| `POST` | `/api/settings/test-webhook` | Ping test target webhook URL and measure latency |
| `POST` | `/api/webhook/results` | Async callback endpoint for external n8n pipelines |

---

## 👥 Hackathon Submission Details

- **Project Name**: ReturnShield AI
- **Repository**: [https://github.com/gintama1018/AGENTIC-AI-HACKATHON](https://github.com/gintama1018/AGENTIC-AI-HACKATHON)
- **Author**: Sonu Jangir (`gintama1018`)
- **Email**: `Sonu.jangir2024@uem.edu.in`
- **Hackathon**: Agentic AI Hackathon 2026
