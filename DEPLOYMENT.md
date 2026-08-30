# ReturnShield AI — Live Cloud Deployment Guide

This guide provides step-by-step instructions to deploy **ReturnShield AI** for hackathon evaluation:
- **Backend**: Hosted on [Render](https://render.com) (Node.js Web Service)
- **Frontend**: Hosted on [Vercel](https://vercel.com) (React + Vite SPA)
- **Agent Orchestration**: Published on [n8n Cloud](https://sonujangid105.app.n8n.cloud)

---

## 🚀 Part 1: Deploy Backend on Render

### Step 1: Create a New Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/gintama1018/AGENTIC-AI-HACKATHON`.

### Step 2: Configure Service Settings
- **Name**: `returnshield-backend` (or any preferred name)
- **Region**: Singapore / Frankfurt / Oregon
- **Root Directory**: `server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`
- **Plan**: Free

### Step 3: Add Environment Variables
In the **Environment** section, add the following variables:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production safeguards |
| `PORT` | `5000` | Render will automatically bind ports |
| `JWT_SECRET` | `returnshield-secret-production-key-2026` | Any secure random string |
| `N8N_WEBHOOK_SECRET` | `returnshield_prod_secret_2026` | Webhook secret configured on n8n |
| `N8N_BASE_URL` | `https://sonujangid105.app.n8n.cloud` | Your published n8n cloud instance |
| `N8N_ANALYSIS_WEBHOOK_URL` | `https://sonujangid105.app.n8n.cloud/webhook/returns-agent` | Main Workflow 1 webhook |
| `N8N_FOLLOWUP_WEBHOOK_URL` | `https://sonujangid105.app.n8n.cloud/webhook/returnshield-ask` | Ask Agent Workflow 2 webhook |
| `N8N_FEEDBACK_WEBHOOK_URL` | `https://sonujangid105.app.n8n.cloud/webhook/returnshield-feedback` | Human Approval Workflow 3 webhook |
| `ALLOW_DEMO_MODE` | `true` | Allows judges to test 1-click Demo Login |

### Step 4: Deploy & Verify
1. Click **Create Web Service**.
2. Once deployment completes, copy your Render URL (e.g. `https://returnshield-backend.onrender.com`).
3. Verify in browser: `https://returnshield-backend.onrender.com/api/health` should return `{"status": "online"}`.

---

## 🎨 Part 2: Deploy Frontend on Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository: `gintama1018/AGENTIC-AI-HACKATHON`.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: Click *Edit* and select `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variable
Add the single required frontend environment variable:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-backend-name.onrender.com` | Your live Render backend URL (no trailing slash) |

### Step 4: Deploy & Verify
1. Click **Deploy**.
2. Once complete, visit your live Vercel URL (e.g. `https://agentic-ai-hackathon.vercel.app`).
3. Click **Open Live Workstation** → **Sign In as Demo Lead**.
4. Test the live flow: Overview, Returns Table, Problem SKUs, Actions Hub, and Ask ReturnShield!

---

## 🔒 Evaluation Testing Checklist (For Judges & Team)

```text
[ ] 1. Visit Live Vercel App -> Click "Open Live Workstation"
[ ] 2. Click "Sign In as Demo Lead" -> Access Overview Briefing
[ ] 3. Check Live Run ID & Self-Verification status badge (Passed)
[ ] 4. Navigate to Import -> Click "Load Realistic India D2C Batch (15 Orders)" -> Ingest
[ ] 5. Navigate to Returns -> Click eye or link to inspect forensic evidence dossiers
[ ] 6. Navigate to Actions -> Click "Approve & Record Intervention" -> Verify Workflow 3 storage
[ ] 7. Click "Ask ReturnShield" (✨ button) -> Ask a question -> Observe real LangChain tools executed
```
