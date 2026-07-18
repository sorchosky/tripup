# docs/brief.md — Submission Brief & QA Rubric

**What this file is.** The evaluator's-eye view of TripUp: the submission requirements, the user flow
being assessed, and a scored rubric for grading progress. It doubles as an in-the-loop **QA
instrument** — pull it in at the end of each iteration, score against it, log the gaps, and check that
the build hasn't drifted from the brief. Treat a green rubric (all criteria "Meets" or better, no open
gaps) as the definition of submission-ready.

> Reconstructed from the Notion "5-Day Project Plan" (deliverables tracker + evaluation questions +
> standout-factor priority). The **verbatim brief text is not yet captured** — see the placeholder at
> the bottom. Items below are labeled as sourced from the plan, not invented brief language.

---

## 1. Submission requirements (pass / fail)

Every item is a hard requirement. A single fail = not submittable.

- [ ] **Wireflow, ≤10 screens**, real content (no lorem ipsum), in a dedicated Figma section
- [ ] **2 hi-fi screens** at full visual fidelity
- [ ] **Working coded prototype** — actual code, *not* Figma prototype mode — mobile-optimized,
      deployed, and shareable via public link
- [ ] **Hi-fi screens visibly present in the prototype** (the coded build reflects the hi-fi design)
- [ ] **Figma sharing** set to "Anyone with the link can view"
- [ ] **All text in English**, no lorem ipsum anywhere
- [ ] **Reference device** chosen, dimensions kept **unscaled** (iPhone 14, 390×844)
- [ ] Links verified in a **private/incognito** window (prototype loads without your session; no zip files)

## 2. The user flow being assessed (rich detail)

The prototype has to carry Ari's Lisbon scenario end to end, and — per the brief's own bar — someone
**unfamiliar with the app must be able to follow it without explanation**. Every decision point should
be visible on screen.

Beat sheet (canonical order):

1. **Home / trip list** — Ari opens the app to their trips.
2. **Trip detail** — the Lisbon trip: who's in, what's planned, where the money stands.
3. **Add participant** — Ari adds Ren; the group updates.
4. **Create poll** — Ari proposes where to eat (named options).
5. **Poll voting — live** — the group votes; **vote counts update live**, a leading option is visible.
6. **Poll closes → itinerary updates** — the result **writes into the itinerary** automatically.
7. **Log expense (+ receipt scan)** — a shared cost is recorded; the **receipt-scan** state (mocked)
   auto-populates the form as the standout feature.
8. **Expense exclusions → balances** — the wine is split among drinkers only; **Ren and Nic are
   excluded**; **balances recalculate** to reflect it.
9. **Debt consolidation / settle up** — balances resolve into **minimum transfers** (fewest payments),
   not a full mesh of IOUs.
10. **Settlement confirmation** — settled; everyone's even.

**The graded state changes** (call these out; they're what's assessed first): live vote counts, poll
close → itinerary write, expense exclusion, balance recalculation, minimum-transfer consolidation,
settle-up confirmation.

## 3. Evaluation rubric (scored)

Score each criterion: **0 Not started · 1 Partial · 2 Meets · 3 Exceeds.** Weight reflects the plan's
stated priorities (prototype quality first). Weighted score = score × weight; track the total across
iterations to see whether you're converging.

| # | Criterion | What "Meets" looks like | Weight |
| --- | --- | --- | --- |
| C1 | **Scenario fully satisfied** | Every beat above is present and reachable in the coded prototype | ×3 |
| C2 | **Usable without guidance** | A cold tester completes Ari's flow with zero narration; every decision point is visible | ×3 |
| C3 | **Prototype quality** | Real coded prototype, mobile-optimized, deployed, smooth; the primary deliverable | ×3 |
| C4 | **Hi-fi ↔ prototype fidelity** | The 2 hi-fi screens are visibly, faithfully present in the code | ×2 |
| C5 | **Screen polish & system consistency** | Same type scale, spacing rhythm, radii, and semantic color roles doing the same job across screens | ×2 |
| C6 | **Added value beyond the brief** | One well-executed extra — receipt-scan expense entry — not several half-built ones | ×2 |
| C7 | **Engineering judgment** | Real minimum-transfer debt logic in code, not a visual mock | ×1 |
| C8 | **Accessibility baseline** | WCAG AA contrast on text/semantic colors; touch targets ≥ 44×44 | ×1 |

**Priority order if time is short** (from the plan — protect the top, cut from the bottom):
1. Prototype quality over Figma polish (stated twice in the brief).
2. One well-executed extra feature (receipt scan), not several half-built ones.
3. Real debt-consolidation logic, not just a visual mock.
4. Design-system discipline visible across screens.

### Scorecard (update each iteration)

| Date | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | Weighted total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _init_ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 / 51 | Skeleton only — no screens built yet |
| 2026-07-17 | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 45 / 51 | First pass: full flow coded + verified end-to-end via headless-Chromium walk; both hi-fi screens faithful; real min-transfer logic; per-item exclusion recalcs live. C3 held at Meets pending the live Vercel link + on-device check; C8 Meets pending a full contrast/44px audit. |

_(Max weighted total = 3×(3+3+3+2+2+2+1+1) = 51.)_

## 4. Submission-readiness gap tracker

Living list of what still needs to be added. Close items as they land; nothing open here at submission.

- [x] Design tokens finalized (`DESIGN.md` + `tokens.css`) — locked from hi-fi; glass/avatar/tracking tokens added this pass
- [x] Wireflow built (≤10 screens, real content) in Figma — node 29:854
- [x] 2 hi-fi screens designed — poll reveal (screen 6) + receipt scan/assign (screens 7–8), node 29:2972
- [x] Hi-fi screens ported into code — `PollClosedScreen`, `SplitScreen`; verified against Figma
- [x] All screen components implemented against tokens + mock data — 9 routes (7+8 fused)
- [x] Shared state wired so graded transitions actually fire — `TripContext` reducer; walked end to end
- [x] `src/lib/settle.ts` minimum-transfer logic implemented for real — output matches the hi-fi footer
- [x] Receipt-scan (mocked) state built into the expense flow — canned receipt on `/split`
- [x] Mock data locked in `CONTENT.md` (restaurant names, amounts) — trip dates still TBD (not invented)
- [ ] Deployed to Vercel; public link verified in incognito — **in progress this pass**
- [ ] Figma sharing set to "Anyone with the link can view" — owner action (Steve)
- [x] Full English/lorem-ipsum proofread pass — all copy English, written from BRAND.md
- [ ] Verbatim brief pasted below and reconciled against sections 1–3 — owner action (Steve)

## 5. How to run this as a QA pass

Mirror the Day-5 discipline — do this before calling any iteration done:

1. **Cold demo run-through.** Walk Ari's full flow as if demoing it to a PM who's never seen it.
2. **Score every rubric criterion** (section 3) and add a dated row to the scorecard.
3. **Log gaps** in the tracker (section 4); note any drift from the beat sheet.
4. **No new scope late.** Near submission, fix friction — don't add features.
5. **Report, don't paper over.** If a criterion regressed or a requirement fails, say so plainly and
   where it's stuck, rather than quietly moving on.

## 6. Verbatim brief

> **Placeholder — paste the original Bending Spoons brief text here.** Once pasted, reconcile it
> against sections 1–3: confirm the requirements, scenario, and evaluation criteria above match the
> real brief, and correct anything that was reconstructed from the plan rather than stated verbatim.
