# ReturnShield AI v3 — Final Architecture & Gap Audit

This is a critical review of your v2 workflow against the full 35-section agentic spec, and the upgrade that closes the gaps that actually matter. Rule #1 was followed throughout: the webhook (same path/ID), Gemini, the deterministic-first philosophy, and everything that already worked survives untouched. Three files came out of this:

1. `return_shield_workflow_v3.json` — the main analysis pipeline (upgraded in place)
2. `return_shield_ask_agent_workflow.json` — NEW companion workflow, tool-using conversational follow-up
3. `return_shield_feedback_workflow.json` — NEW companion workflow, human-approval + outcome recording

All jsCode in all three passed `node --check`, and the full deterministic chain (Normalize → Data Quality → Analytics → Trend Delta → Merge → Prepare Synthesis → Priority & Impact → Self-Verification → Final JSON Builder → Record Run In Memory) was executed twice in sequence against `sample_test_payload.json` through a Node harness that stands in for n8n's `$input`/`$json`/`$()`/`$getWorkflowStaticData`, with the three AI stages stubbed by plausible mock outputs — including a deliberately hallucinated recommendation (bogus SKU) and a deliberately over-claimed "high confidence" root cause, both of which the Self-Verification Engine caught and downgraded correctly. The two-run harness also confirmed trend memory works: run 1 correctly reported "no previous run," run 2 correctly diffed against run 1's stored numbers.

---

## SECTION A — Audit of v2 (what's good, what's missing, what's weak)

**Already good — kept as-is:**
- Full alias table, deterministic `journey_outcome` derivation, honest rate-gating on optional `order_summary`, `MIN_SAMPLE`-gated hotspot detection, actual-vs-estimated cost labeling, PII minimization before the LLM ever sees a record, non-blocking Google Sheets logging. This is not "CSV → LLM → summary" — it was already a real deterministic-analytics-first system.
- `gemini-3.1-flash-lite` is a real, current Gemini model ID (verified) — not a stale name, left untouched.

**Missing (genuine gaps against the spec, not padding):**
- **No self-verification stage.** The spec's own output contract (§23) has a `"verification": {}` key; it didn't exist. Nothing re-checked whether the LLM's `confidence`/`status` claims actually matched the deterministic `sufficient_evidence` flag before they reached the response.
- **No hypothesis comparison (§11).** Root-Cause Synthesizer produced one `likely_cause` + one `alternative_explanation` — not competing hypotheses with supporting/contradicting evidence and a "what would confirm this" next step.
- **No retry/graceful-degrade on the 3 agent nodes.** A single Gemini timeout or rate-limit would 500 the whole webhook instead of degrading, contradicting §21.
- **No run identity, no memory, no "what changed since last run" (§18/19/24).** Nothing tied one run to the next.
- **No human-in-the-loop flagging (§16).** Recommendations that touch COD eligibility, courier routing, refunds, or customer messaging were indistinguishable from routine ones.
- **No tool-using conversational follow-up (§17/24).** The architecture doc correctly identified this as "a small additive workflow, not a redesign" — it just hadn't been built yet.
- **No row-count guard** — a known, documented, unfixed gap from your own v2 doc (Section K: "not handled automatically").

**Weak / redundant — explicitly NOT changed, with reasoning:**
- The spec's suggested output-contract field names (`product_analysis`, `courier_analysis`, `priorities`, etc.) differ cosmetically from your existing `segments.sku/courier/...` and `top_problems`. I kept your existing names. Renaming would break your frontend integration (already documented in your own doc M) for zero functional gain — that's exactly the "complexity for visual appearance" §32 tells us to avoid.
- I did **not** add a vector DB, RAG, or a second/third LLM provider. Nothing in the gap list needed it.

---

## SECTION B — Final architecture (data flow)

```
Webhook - Returns In
  → Normalize & Validate Data  [+run_id, +row cap]
    → IF - Has Usable Records
        ├─ false → Build Validation Error Response ──────────────────────┐
        └─ true  → Data Quality Check  [+run_id threaded]                 │
                     → Deterministic Analytics Engine                     │
                       → Compute Trend Delta  [NEW - static-data memory]  │
                         → Select Records To Classify                     │
                           → Reason Classifier (AI, retry+degrade)        │
                             → Merge Classifications with Analytics       │
                               → Prepare Synthesis Input                  │
                                 → Root-Cause Synthesizer (AI, +hypotheses)│
                                   → Priority & Impact Engine             │
                                     → Recommendation Agent (AI, retry)   │
                                       → Self-Verification Engine [NEW]   │
                                         → Final JSON Builder ────────────┤
                                                                          ↓
                                                                Respond to Webhook
                     Final JSON Builder → Log to Google Sheets (optional, parallel)
                     Final JSON Builder → Store Analysis Snapshot (optional, parallel, Data Table)
                     Final JSON Builder → Record Run In Memory (parallel, static data)
```

Companion workflows (separate files, separate webhooks, share the Gemini credential):

```
Webhook - Ask → Prepare & Validate Ask Request → IF valid
  ├─ false → Build Ask Error Response → Respond
  └─ true  → IF context provided
       ├─ true  → Context Ready ──────────────┐
       └─ false → Fetch Context By Run ID      │
                    → Merge Fetched Context     │
                      → IF found                │
                          ├─ true → Context Ready
                          └─ false → Build Ask Error Response → Respond
                                     ↓
                              Ask Agent (+6 read-only tools, Gemini)
                                → Format Answer → Respond

Webhook - Feedback → Prepare & Validate → IF valid
  ├─ false → Build Feedback Error Response → Respond
  └─ true  → Store Feedback (Data Table) → Build Success Response → Respond
```

---

## SECTION C — Node-by-node plan (new / modified nodes only)

| Node | Type | Purpose | Input | Output |
|---|---|---|---|---|
| **Normalize & Validate Data** (modified) | Code | +generates `run_id`; +caps input at 5,000 rows with a `truncated` flag instead of choking on huge payloads | webhook body | `records, order_summary, meta{...,run_id,truncated}` |
| **Compute Trend Delta** (new) | Code | Reads `$getWorkflowStaticData('global')` for the last run's summary and computes `change_since_last_analysis` — zero external DB | `records, analytics, data_quality` | same + `change_since_last_analysis` |
| **Self-Verification Engine** (new) | Code | Re-derives whether each recommendation/root-cause is actually traceable to real segment data; caps confidence the model can't back up; flags consequential actions for human approval; assembles the flat `hypotheses` list | Priority & Impact Engine output + Recommendation Agent output | `root_causes, top_problems, recommendations, hypotheses, verification` (corrected) |
| **Record Run In Memory** (new) | Code | Writes this run's summary into `$getWorkflowStaticData('global')` for the *next* run's Trend Delta | Final JSON Builder response | `{stored, run_id, history_length}` |
| **Store Analysis Snapshot** (new, optional) | Data Table (insert) | Cross-workflow memory — lets Ask-Agent/Feedback look up a run by `run_id` | Final JSON Builder response | Data Table row |
| **Final JSON Builder** (modified) | Code | Reads from Self-Verification Engine instead of directly from the agent; adds `run`, `hypotheses`, `trends`, `verification`, `next_best_questions` to the contract | verification-corrected data | full response object |
| **Root Cause Schema** (modified) | Structured Output Parser | Added required `hypotheses[]` (1–3 items) per root cause | — | — |
| **Reason Classifier / Root-Cause Synthesizer / Recommendation Agent** (modified) | Agent | `retryOnFail: true, maxTries: 2, waitBetweenTries: 2000`, `continueOnFail: true`, `onError: continueRegularOutput` | — | — |

Full JS for every node above is in the workflow JSON itself (`parameters.jsCode`) — see Section J note below on why it isn't duplicated here.

---

## SECTION D — Agent design

### Reason Classifier — unchanged
Role: classify each return/RTO record's raw text into exactly one category from the outcome-appropriate taxonomy. Unchanged from v2 — it was already correctly scoped and gated.

### Root-Cause Synthesizer — modified
**Goal:** turn pre-filtered hotspot segments + reason categories into problem statements, each with 1–3 **distinct** competing hypotheses.
**New contract per hypothesis:** `hypothesis, supporting_evidence, contradicting_evidence, confidence, next_test`.
**Failure behavior:** on repeated failure, `root_causes` is empty; `data_quality.stage_failures` records it; deterministic segment/hotspot data in the response is completely unaffected.

### Recommendation Agent — unchanged prompt, new downstream guardrail
Still one recommendation per top problem. The *trustworthiness* of its output is no longer taken on faith — Self-Verification Engine re-checks it.

### Ask Agent — new
**Goal:** answer follow-up questions using ONLY tool calls against an already-computed analysis — never re-analyzes, never invents a number.
**Allowed actions:** call any of its 6 tools, then answer.
**Input:** `{question, context}` (or `{question, run_id}`).
**Output schema:** `{answer, confidence, caveats[], tools_used[]}`.
**Failure behavior:** on repeated failure, returns a clear "couldn't complete this" message with `status: "failed"` — never a 500.

---

## SECTION E — Tool design (Ask Agent)

| Tool | Input (`query` string) | Reads from | Purpose |
|---|---|---|---|
| `get_segment_metrics` | `"dimension:value"` e.g. `"courier:Xpress Logistics"` | `context.segments.*` | One segment's counts/value/uplift/evidence + % of total affected value |
| `get_reason_distribution` | `"returned" \| "rto" \| ""` | `context.reason_analysis` | Category breakdown |
| `get_top_problems` | number or blank | `context.top_problems` | Ranked problems |
| `get_recommendations` | `P0-P3` or blank | `context.recommendations` | Filtered action list |
| `compare_to_previous_run` | ignored | `context.trends[0]` | "What changed since last time" |
| `get_hypotheses` | keyword or blank | `context.hypotheses` | Competing explanations for a problem |

All 6 are `@n8n/n8n-nodes-langchain.toolCode` nodes. **Important n8n contract**: Code Tool nodes receive a single string variable `query` (not `$input`/`$json`) and must `return` a string — every tool `JSON.stringify()`s its result. They still read shared state via `$('Context Ready').first().json.context`, which is a workflow-level reference, not a main-input dependency, so this works even though `$input` doesn't.

Why tools instead of dumping the whole JSON into the prompt: a large analysis response can be tens of KB; forcing the agent to call a narrow, purpose-built tool keeps answers grounded in a specific slice of real data instead of the model skimming a wall of JSON and guessing.

---

## SECTION F — Memory / state design

**Two tiers, deliberately not one:**

1. **Same-workflow trend memory** — `$getWorkflowStaticData('global')` in the main workflow. Zero credentials, zero setup, survives restarts, works out of the box on any n8n instance. Used for "what changed since the last analysis." Capped at the last 20 runs. **Limitation, stated honestly:** static data is per-workflow and (on multi-worker queue-mode deployments) not guaranteed to be perfectly synchronized — fine for a single hackathon/demo instance, worth swapping for a real table if you scale to queue mode later.
2. **Cross-workflow memory** — an n8n **Data Table** (`returnshield_runs`, `returnshield_feedback`) — n8n's built-in lightweight persistent store, no external DB, shared across workflows on the same instance. Used so the separate Ask-Agent and Feedback workflows can look up a run by `run_id`. **You must create these two tables once** in the n8n UI (Data tables tab) before first use — see the Sticky Notes on each workflow for exact column names. Until you do, every Data Table node degrades gracefully (`continueOnFail` + `alwaysOutputData`) rather than breaking anything.

**What's stored:** run_id, generated_at, top_problem, affected_order_value_inr, analysis_confidence, and (Data Table only) the full snapshot JSON.
**How retrieved:** static data read at the start of the next run (automatic); Data Table read on-demand by run_id (Ask-Agent).
**How used:** trend deltas in the main response; grounding context for follow-up questions; audit trail for feedback.

I deliberately did **not** reach for Postgres/Supabase even though your spec allows it — the two zero-dependency mechanisms above satisfy every actual requirement (§18/19/24) without adding a credential that could be missing on demo day. If you outgrow this (multi-tenant, queue mode, need SQL joins across runs), that's the natural Phase-2 swap, not a hackathon-day requirement.

---

## SECTION G — Verification design (how hallucination is actually caught)

The Self-Verification Engine performs 6 deterministic checks, never asking the LLM to grade itself:

1. **Recommendation → real problem traceability.** Every `recommendation.target` must substring-match a real `top_problems[].segment_value`. If it doesn't, confidence is capped at 0.3 and it's flagged `unverified_target: true`.
2. **Confidence vs. evidence cap.** A recommendation can't claim confidence above 0.5 unless its matched problem has `sufficient_evidence: true`.
3. **Root-cause confidence vs. `sufficient_evidence`.** A root cause can't stay "high" confidence if the underlying segment didn't clear `MIN_SAMPLE` — downgraded to "low" and `status` forced to `"hypothesis"`.
4. **Root-cause segment traceability.** Same re-join as check 1, applied to root causes.
5. **Required-field presence.** Every recommendation is checked against the 8 required schema fields.
6. **Consequential-action flagging.** Deterministic keyword match (COD eligibility, blacklisting, courier reassignment, customer messaging, refunds/pricing) sets `requires_human_approval` — this is *not* left to the model's own judgment, exactly because a model describing its own risk level is the thing being verified, not the verifier.

Output: `verification.status` is `"passed"` or `"passed_with_corrections"`, with `issues_found[]` and `corrections_applied[]` listing exactly what was downgraded and why. Nothing is silently dropped — it's demoted and disclosed.

---

## SECTION H — Error / retry design

| Failure | Caught where | Behavior |
|---|---|---|
| Empty/malformed body | Normalize & Validate Data | Structured JSON error via the same Respond node, not a 500 (unchanged from v2) |
| >5,000 rows | Normalize & Validate Data (NEW) | Truncates, sets `data_quality.input_truncated`, surfaces in `data_gaps` |
| Any of the 3 main-workflow AI agents fails after 2 retries | `continueOnFail` on the agent + explicit `.error` check downstream | That stage's output degrades to empty array; `data_quality.stage_failures` records exactly which stage; `run.status` becomes `"partial"` instead of `"success"`; the rest of the response is unaffected |
| Ask Agent fails after 2 retries | `continueOnFail` + `Format Answer` | Returns a clear "couldn't complete this" message, `status: "failed"` |
| Data Table not yet created | `continueOnFail` + `alwaysOutputData` on every Data Table node | Main response, Ask answers, and Feedback recording all still work — only the specific memory feature that needed the table degrades |
| Google Sheets credential missing/expired | unchanged from v2 | Main response already sent via the parallel branch |
| Divide-by-zero, unparseable dates | unchanged from v2 (`safeDiv`, `isNaN` guards) | Returns `null`, never `NaN`/`Infinity` |

---

## SECTION I — JSON schemas (new/changed only)

**Root Cause Schema** (Classification Schema and Recommendation Schema are unchanged from v2):
```json
{
  "type": "object",
  "properties": {
    "root_causes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "dimension": {"type": "string", "enum": ["sku","courier","pincode","zone","category","payment_method","reason"]},
          "segment_value": {"type": "string"},
          "problem": {"type": "string"},
          "evidence": {"type": "string"},
          "business_impact": {"type": "string"},
          "likely_cause": {"type": "string"},
          "alternative_explanation": {"type": "string"},
          "confidence": {"type": "string", "enum": ["high","medium","low"]},
          "status": {"type": "string", "enum": ["confirmed_pattern","hypothesis"]},
          "hypotheses": {
            "type": "array", "minItems": 1, "maxItems": 3,
            "items": {
              "type": "object",
              "properties": {
                "hypothesis": {"type": "string"},
                "supporting_evidence": {"type": "string"},
                "contradicting_evidence": {"type": "string"},
                "confidence": {"type": "string", "enum": ["high","medium","low"]},
                "next_test": {"type": "string"}
              },
              "required": ["hypothesis","supporting_evidence","contradicting_evidence","confidence","next_test"]
            }
          }
        },
        "required": ["dimension","segment_value","problem","evidence","business_impact","likely_cause","alternative_explanation","confidence","status","hypotheses"]
      }
    }
  },
  "required": ["root_causes"]
}
```

**Ask Agent Answer Schema:**
```json
{
  "type": "object",
  "properties": {
    "answer": {"type": "string"},
    "confidence": {"type": "number"},
    "caveats": {"type": "array", "items": {"type": "string"}},
    "tools_used": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["answer","confidence","caveats","tools_used"]
}
```

**Final response contract additions** (everything else unchanged from v2's Section H):
```json
{
  "run": {"id": "rs_...", "generated_at": "ISO", "status": "success|partial|failed"},
  "trends": [{"available": true, "compared_to_run_id": "...", "returned_count_change": 0, "rto_count_change": 0, "affected_order_value_change_inr": 0, "affected_order_value_change_pct": 0, "previous_top_problem": "..."}],
  "hypotheses": [{"source_problem": "...", "dimension": "...", "segment_value": "...", "hypothesis": "...", "supporting_evidence": "...", "contradicting_evidence": "...", "confidence": "...", "next_test": "..."}],
  "verification": {"checks_performed": [], "issues_found": [], "corrections_applied": [], "status": "passed|passed_with_corrections"},
  "next_best_questions": ["..."]
}
```

Recommendation objects gain: `requires_human_approval` (bool), `approval_reason` (string|null), `unverified_target` (bool).

---

## SECTION J — Code nodes

All JS lives in each node's `parameters.jsCode` inside the three workflow JSON files — that's the copy n8n will execute, and duplicating it here risks drift (same reasoning your v2 doc already used). Every Code node across all three workflows passed `node --check`, and the main workflow's deterministic chain was executed end-to-end twice through a Node.js harness against `sample_test_payload.json` (see the intro above for what that caught).

One n8n-specific gotcha worth flagging explicitly: **Code Tool nodes (`toolCode`) do not have `$input`/`$helpers`** — they receive a plain string `query` and must `return` a string. This is different from every other Code node in these workflows, which is why the 6 Ask-Agent tools look structurally different from the main pipeline's Code nodes.

---

## SECTION K — Test suite

See `test_suite.md` for all 12 cases (A–L) with input shape, expected detection, expected confidence, expected recommendation behavior, and expected non-claims (what the system must *not* say).

---

## SECTION L — Demo flow (3–5 minutes)

1. **POST `sample_test_payload.json`** to the main webhook → walk through the response top-down: `run.status: "success"`, `data_quality.analysis_confidence`, `metrics` (note `rates.rates_available: false` — call this out as a *feature*, not a bug: "we don't fabricate a rate we can't compute").
2. **Point at `top_problems[0]`** (courier Xpress Logistics, P0, sufficient evidence) vs **`top_problems[3]`** (Delhivery, same RTO share, P2, insufficient evidence) — same-looking numbers, different priority tier, because sample size matters.
3. **Open `hypotheses`** for the Xpress Logistics problem — show 2 competing explanations with different `next_test` values. This is the "AI reasons, doesn't just summarize" beat.
4. **Open `verification`** — if `status: "passed_with_corrections"`, show `corrections_applied` — "the system caught its own model overclaiming and fixed it before you ever saw it."
5. **POST to the Ask-Agent webhook** with `{"question": "Why is Xpress Logistics our biggest problem?", "context": <the response from step 1>}` — show `tools_used` in the reply, proving it called a tool instead of freehand-answering.
6. **POST to the Feedback webhook** approving one `requires_human_approval` recommendation — close the loop: AI proposes → human approves → outcome recorded.

That's OBSERVE → REASON → COMPARE HYPOTHESES → DECIDE → ACT → VERIFY → (ASK) → LEARN, in six webhook calls.

---

## SECTION M — Agentic justification (per major feature)

- **Hypotheses with next_test, not just a single cause:** ordinary automation states an answer; an agent frames competing explanations and says what evidence would discriminate between them. That's a reasoning step, not a lookup.
- **Self-Verification Engine:** ordinary automation trusts its last step's output. This system re-derives ground truth independently and *overrules* the LLM when they disagree — the code, not the prompt, has final authority over what confidence level ships.
- **Trend memory + "what changed":** ordinary automation is stateless per request. This maintains continuity across runs without any external service, and answers a genuinely different question ("what changed") that a single-shot analysis structurally cannot answer.
- **Tool-using Ask Agent:** ordinary automation would re-run the whole pipeline or paste a canned FAQ. This agent decides which of 6 narrow, read-only tools answers a specific question, grounded in one specific run's real numbers — that's tool selection under uncertainty, the textbook agentic behavior.
- **Human-in-the-loop flagging:** ordinary automation either executes everything or nothing. This system autonomously classifies which of its own recommendations are consequential enough to require a human, without being told per-recommendation which ones those are.

---

## SECTION N — Remaining high-value improvements

Being honest after a serious review, not padding this list:

1. **Real statistical testing (confidence intervals) instead of the `MIN_SAMPLE` threshold** — legitimate upgrade for post-hackathon production use with larger datasets, deliberately *not* done here because your own spec (§6) explicitly warns against fake statistical precision at small sample sizes, and doing it "for real" needs a stats library and more data than a hackathon demo dataset will have.
2. **Queue-mode-safe cross-workflow memory** (swap static data / Data Tables for Postgres) if this ever runs with multiple n8n workers — not needed for a single-instance demo.
3. **Actual execution nodes behind approved recommendations** (e.g., a real Shopify/courier API call gated on `outcome: approved`) — explicitly out of scope per your own Rule #1 ("do not make external APIs mandatory for the MVP") and your spec's own Phase 5 roadmap ("Automated intervention" is a later phase, not this one).

Nothing else on the 35-section spec is unaddressed in a way that would change a judge's assessment of "genuinely agentic decision system" vs. "sequence of LLM calls."
