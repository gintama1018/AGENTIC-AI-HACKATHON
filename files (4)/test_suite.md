# ReturnShield AI v3 — Test Suite (spec section 29)

Twelve cases, each targeting one gating rule or edge case the pipeline needs to get right. For A–D and F–H, small illustrative payloads are given inline — build the full JSON the same shape as `sample_test_payload.json` (POST as `{"returns": [...]}`). Case E reuses `sample_test_payload.json` as-is (it already exercises this). "Expected non-claims" are as important as expected detections — these are the things the system must NOT say.

---

### A. Strong sizing pattern
**Input:** 15+ `returned` records, same SKU, `reason_text` variants of "size chhota/bada hai", `MIN_SAMPLE` cleared.
**Expected detection:** `reason_analysis.return_categories` has "Sizing/Fit" with `sufficient_evidence: true`. Root cause `status: "confirmed_pattern"`.
**Expected confidence:** high.
**Expected recommendation:** "Re-shoot size chart / correct product content for SKU X" framed as a full rollout (not a pilot).
**Expected non-claims:** must not say "statistically significant"; must not claim a specific % improvement not derivable from input.

### B. Strong quality pattern
**Input:** 12+ `returned` records, one SKU, comments like "quality kharab hai / product damaged".
**Expected detection:** "Quality Defect" category, sufficient evidence.
**Expected confidence:** high.
**Expected recommendation:** batch/quality inspection for that SKU.
**Expected non-claims:** must not claim manufacturing defect cause without evidence beyond the returns themselves — "likely_cause" language, not "confirmed cause."

### C. Strong RTO pattern
**Input:** 15+ `rto` records concentrated in one courier + one pincode simultaneously (cross-dimension).
**Expected detection:** both `segments.courier` and `segments.pincode` flag `hotspot_sufficient_evidence`; ideally both surfaced as separate root causes referencing the same underlying orders.
**Expected confidence:** high on both.
**Expected recommendation:** two distinct actions (courier escalation + pincode-specific COD/OTP pilot), not one generic action covering both.

### D. COD-driven RTO
**Input:** COD orders with RTO rate much higher than prepaid, both segments ≥ `MIN_SAMPLE`.
**Expected detection:** `cod_vs_prepaid.sufficient_evidence: true`, clear share gap.
**Expected confidence:** medium–high depending on gap size.
**Expected recommendation:** OTP/WhatsApp confirmation pilot for COD orders in the affected segment.
**Expected non-claims:** must not say "COD causes RTO" as proven causation — "likely contributor" / "consistent with" language only, and the hypotheses array should list at least one alternative (e.g., address quality) alongside the COD-confirmation hypothesis.

### E. Courier anomaly (uses `sample_test_payload.json` as-is)
**Expected detection:** Xpress Logistics hotspot (14 events, uplift ~1.84×) → `top_problems[0]` or `[1]`, P0.
**Expected confidence:** high.
**Expected recommendation:** ops escalation with this courier, framed as full action (sufficient evidence).

### F. Pincode hotspot
**Input:** same as sample payload's pincode 305001 cluster (14 RTOs).
**Expected detection:** pincode segment `hotspot_sufficient_evidence`, uplift ≥1.5×.
**Expected confidence:** high.
**Expected recommendation:** address-validation / OTP pilot for that pincode specifically, not the whole zone.

### G. Small-sample misleading pattern
**Input:** a 4-order segment (any dimension) with 100% RTO share (uplift technically enormous).
**Expected detection:** flagged `hotspot_hypothesis_insufficient_sample`, NOT `hotspot_sufficient_evidence`, despite the extreme uplift number.
**Expected confidence:** low, `status: "hypothesis"`.
**Expected recommendation (if any):** framed as "pilot/validate on a small scale first," never a full rollout.
**Expected non-claims:** must not call this "confirmed" anywhere in the response, and Self-Verification Engine must downgrade it if the model tries to claim high confidence — this is exactly what the harness's mock-run test exercised and caught.

### H. Missing data
**Input:** records missing `courier`, `pincode`, `payment_method`, `customer_comment` on most rows.
**Expected detection:** `data_quality.fields_largely_missing` lists them; `analysis_confidence: "low"`.
**Expected recommendation behavior:** system still returns a full response (never errors) but `data_gaps` clearly states what's missing and why confidence is low.

### I. Contradictory evidence
**Input:** a segment with both a strong RTO hotspot AND explicit reason-text signals pointing to a *different* cause than the obvious one (e.g., high RTO in a pincode, but reason text mostly says "wrong address" not "COD refusal" despite mostly-COD orders).
**Expected detection:** Root-Cause Synthesizer's `hypotheses` should surface both candidate explanations with differing `supporting_evidence`, and `contradicting_evidence` on the COD hypothesis should reference the address-issue reason text.
**Expected non-claims:** must not pick one hypothesis and hide the other.

### J. Empty comments
**Input:** `return_reason_raw`/`rto_reason_raw`/`customer_comment` all empty strings across many rows.
**Expected detection:** Reason Classifier returns "Other / Unclear" for all — never guesses.
**Expected recommendation:** none targeting a specific cause for this segment; `data_gaps` may note the classification gap.

### K. Hinglish comments
**Input:** reason text like "size chhota hai", "COD cancel kar diya", "quality bekar thi", "delivery boy nahi aaya".
**Expected detection:** correctly mapped to Sizing/Fit, COD Refusal, Quality Defect, Delivery Attempt Failure respectively — proves the multilingual classification actually works, not just on English text.

### L. Suspected fraud edge case
**Input:** a segment with explicit repeated-refusal language ("baar baar order cancel kiya, lena hi nahi tha") clustered on one customer_type/segment, ≥ `MIN_SAMPLE`.
**Expected detection:** "Possible Low-Intent Order" category may be used — but ONLY because the text gives explicit signal, not inferred from a single vague reason or from silence.
**Expected non-claims:** must NEVER use the words "fraud" or "fraudulent" anywhere in the response (Root-Cause Synthesizer's system prompt hard rule) — "Possible Low-Intent Order" is the ceiling, and even that requires `sufficient_evidence: true` before Self-Verification Engine will let a recommendation act on it (COD-eligibility recommendations touching this segment get `requires_human_approval: true` automatically).

---

## How to actually run these

This sandbox has no live n8n instance or Gemini API key, so these weren't run against a real deployment. What WAS verified:
- The full deterministic chain (everything except the 3 LLM calls) ran end-to-end against `sample_test_payload.json` (covers case E directly, and the sizing/courier/pincode gating logic that cases A, F, G depend on) via a Node.js harness, twice in sequence to prove trend memory.
- A deliberately hallucinated recommendation and a deliberately over-claimed root cause were injected as mock LLM output and confirmed caught by Self-Verification Engine (directly exercises case G's non-claim requirement).
- All jsCode across all three workflow files passed `node --check`.

To actually validate cases A–D, H–L against real Gemini output, build the small payloads described above and POST them to your deployed webhook — the deterministic gating logic underneath is the same code already verified, so the main open question for those cases is whether Gemini's classification/synthesis text respects the prompt's hard rules, which the Self-Verification Engine backstops even if it doesn't.
