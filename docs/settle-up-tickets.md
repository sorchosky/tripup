# docs/settle-up-tickets.md — Settle Up flow tickets (draft)

Draft tickets for the Settle Up redesign pass. Written to the repo's issue template
(`docs/issue-conventions.md`) with the extra fields the request called for: **Components affected**,
**Current behavior**, **Target behavior**, **Acceptance criteria**, **Token/state dependencies**, plus a
**DESIGN.md impact** line and a **Conflicts / flags** section on each. Copy comes from `BRAND.md`, data
from `CONTENT.md`, acceptance gate is `docs/brief.md`.

> These are **drafts**, not filed issues — `[P#]` and branch numbers get their real `#` when each is
> opened on GitHub. Reference images (Sunday `sundayapp.io` pay-at-table flow) are **directional
> inspiration only**; they are a `$` app, ours is `€`, and their visual language (pure black/white,
> emoji tip chips) is not ours — pull the *interaction*, not the styling. All UI is built from the
> locked hi-fi tokens in `DESIGN.md`.

## Reality check before reading (the flow as actually built)

The recommendations describe a few things that don't match the current code. Stated once here so each
ticket can point back to it:

- **There is no "flat balance number."** `/settle` (`SettleUpScreen`) renders a title + step indicator,
  a one-line lede ("Two transfers close it out…"), a **transfers list**, and a **per-person balances
  recap** ("Ari is owed …", "Ren owes …"). The nearest thing to a single balance figure is that recap.
- **There is no settle confirmation *sheet*, and no two-screen review→payment split.** The flow is two
  **full screens**: `/settle` (footer button **"Confirm & settle"**) → dispatches `SETTLE` → navigates
  to `/settle/done` (`SettlementConfirmationScreen`, "Everyone's even"). No payment-method step exists
  anywhere. A reusable `BottomSheet` component *does* exist (`src/components/BottomSheet.tsx`, from #15).
- **The settle math is synchronous.** `derived.transfers` / `derived.balances` are memoized in
  `TripContext` and always resolved on render — there is no async "computing…" state today.
- **Splitting is per-item.** `computeShares`/`computeBalances` (`src/lib/settle.ts`) split each receipt
  line across its assignees; exclusion is the per-item avatar-chip toggle locked in `DESIGN.md` screen 8.
  There is no "even split" or "percentage" mode.
- **Money tokens exist; a disabled role does not.** `--color-owed` (amber `#8a5a08`), `--color-settled`
  (green `#0e7a5f`), `--color-surface-neutral` (`#efede7`) and `--color-text-muted` are defined.
  `--color-primary` (indigo `#5a45d6`) is the CTA/accent. There is **no** dedicated `error`/red token and
  **no** dedicated `disabled` token; the current `Button` disabled look is just `opacity: 0.45`.

---

## Ticket 1 — Settlement progress ring (replace the balance recap's flat figures)

**Priority:** P2 — Settle up (screen 9) refinement; the flow already settles correctly without it.
**Type / Branch:** feat — `feat/<#>-settle-progress-ring`

### Components affected
- `src/screens/SettleUpScreen.tsx` + `.module.css` (host).
- New `SettleRing` (suggest `src/components/SettleRing.tsx` + `.module.css`) — a reusable radial meter.
- Reads `derived.balances` / `derived.transfers` from `src/state/TripContext.tsx`; consumes tokens only.

### Current behavior
The settle-up "how much is outstanding" signal is text: the lede count ("Two transfers close it out")
plus the balances recap rows, each coloring an amount with `--color-settled` (owed to you) or
`--color-owed` (you owe). No graphical balance display.

### Target behavior
A radial progress ring at the top of `SettleUpScreen`, in the spirit of the reference "Amount to share"
dial (IMG_6410). The **filled arc = the portion of the group's debt already settled**; the **remaining
arc = the amount still outstanding**. The arc color moves **continuously** from `--color-owed` (amber,
fully outstanding) to `--color-settled` (green, fully settled) as a single interpolated value — **not a
hard swap at a threshold**. Center holds the outstanding euro figure and a short `BRAND.md` label. On
`SETTLE`, the ring animates to a full green ring.

### Acceptance criteria
- [ ] A radial ring renders on `/settle`, driven by real derived values (not a hardcoded percentage).
- [ ] Fill fraction = settled ÷ total-to-settle; remaining arc = outstanding. Center shows the
      outstanding amount via `euros()` and a label written from `BRAND.md` (no invented copy).
- [ ] Arc color is a continuous interpolation between `--color-owed` and `--color-settled` (verify at
      an intermediate fraction the stroke is neither pure amber nor pure green).
- [ ] On `SETTLE` the ring transitions to a complete green ring; the color change is animated, not a
      class flip. Honor `prefers-reduced-motion` (jump to end state, no sweep).
- [ ] Ring stroke, track, and text all reference tokens — no raw hex/px literals in the component.
- [ ] `npm run build` + `npm run typecheck` pass; driven on-screen at 390×844.

### Token / state dependencies
- **State:** needs a "total to settle" and "settled so far" derivation. Today `settled` is a single
  boolean → the ring only has 0% and 100% to show unless a partial notion is added. Decide: (a) ring is
  binary outstanding→settled keyed off `state.settled` (simplest, honest to current data), or (b) add a
  per-transfer "paid" concept for a partial fill (larger; would also feed Ticket 2's "Pay" step).
- **Tokens:** continuous interpolation is cleanest via `color-mix(in srgb, var(--color-owed) N%,
  var(--color-settled))` driven by a CSS var for `N`, over a `conic-gradient`/SVG stroke. May want new
  `--ring-stroke-width` / `--ring-size` tokens rather than literals. No new *color* token — reuses the
  locked money roles.

### DESIGN.md impact
**Yes — reflect in the same PR (with implementation).** The color roles are already locked, but the ring
is a **new component pattern** and the amber→green **continuous interpolation** is a new, codifiable
design decision. Add a "settlement ring / radial meter" entry under "Component patterns to reuse" and a
line defining the interpolation; fill in screen 9's currently-`TBD` "Key states."

### Conflicts / flags
- ⚠️ **"Flat balance number" doesn't exist** — see reality check. This ticket replaces/augments the
  *balances recap* section, not a single figure. Confirm whether the recap rows stay (ring + recap) or
  the ring subsumes them.
- ⚠️ **Payer-POV semantics.** The flow is single-user **Ari**, who *fronted the whole dinner* and is the
  **sole creditor** — Ari has nothing to "pay down." "Fill = share paid" reads naturally for a debtor
  (Ren/Nic), awkwardly for Ari. Recommended framing is **group-level settlement progress** (how much of
  the total tab is squared), which works from Ari's seat and matches the "everyone's even" payoff.
  This is a product decision — flag rather than silently pick.
- **Interacts with Ticket 2:** the green-fill animation is most naturally triggered by the same `SETTLE`
  moment Ticket 2 relocates into a sheet. Sequence them or make the trigger source explicit.

---

## Ticket 2 — Two-step ("Review" / "Pay") confirmation in a bottom sheet

**Priority:** P1 — Settle up (screen 9), core of the settle interaction.
**Type / Branch:** feat — `feat/<#>-settle-confirm-sheet-segmented`

### Components affected
- `src/screens/SettleUpScreen.tsx` (footer action now opens the sheet instead of dispatching directly).
- `src/components/BottomSheet.tsx` (reuse; may need a variant — see flags).
- New `SegmentedControl` (suggest `src/components/ui.tsx`) — a shared 2-segment control.
- `src/state/TripContext.tsx` (`SETTLE` dispatch moves to the sheet's final step).

### Current behavior
`/settle`'s footer **"Confirm & settle"** button immediately dispatches `SETTLE` and navigates to the
separate `/settle/done` screen. No sheet, no review/pay distinction, no payment-method choice.

### Target behavior
"Confirm & settle" opens a **bottom sheet** (not a route) containing a **two-segment control**:
**"Review"** (the transfers + who-pays-whom recap) and **"Pay"** (confirm/mock payment method), matching
the reference's single-sheet-with-steps model (IMG_6408–6410) rather than stacked screens. Advancing to
"Pay" and confirming dispatches `SETTLE`. Sheet-based navigation (slide-up/down) is preserved; **no new
routes** — honors the "no new screens or routes" scope constraint.

### Acceptance criteria
- [ ] "Confirm & settle" opens a bottom sheet; the sheet slides up and dismisses (down / scrim / close)
      without a route change.
- [ ] The sheet hosts a 2-segment control ("Review" / "Pay"); switching segments swaps content within
      the one sheet.
- [ ] "Review" shows the transfers + balances recap (reuse existing markup). "Pay" shows the confirm
      action (and mock payment-method choice — flagged as new mock content below).
- [ ] Confirming on "Pay" dispatches `SETTLE`; the dinner flips to paid and the user lands on the
      existing "Everyone's even" state. Decide (and note in the PR) whether `/settle/done` stays as the
      success view or the sheet shows success inline.
- [ ] Segment control copy from `BRAND.md`; touch targets ≥44×44; focus/Escape handling consistent with
      the existing `Menu`/sheet patterns.
- [ ] `npm run build` + `npm run typecheck` pass; driven on-screen at 390×844.

### Token / state dependencies
- **State:** `SETTLE` timing moves from the footer to the sheet's confirm; the active segment is local
  `useState`. If a mock payment method is added, that selection is local view-state (not a graded
  reducer transition — same spirit as the mocked receipt scan).
- **Tokens:** segmented control needs active/inactive fills — reuse `--color-surface-neutral` (track),
  `--color-surface-raised`/`--color-text` (active), `--color-text-muted` (inactive), `--radius-full`.
  No new color token expected.

### DESIGN.md impact
**Yes — define before/with implementation.** A **segmented control** is a new pattern **and is distinct
from the existing "step indicator"** (the dot-separated "Scan & assign · Settle up" text) — they must not
be conflated. Add a segmented-control entry to "Component patterns to reuse," and update screens 9–10
notes to describe the sheet-based confirm (currently `TBD`).

### Conflicts / flags
- ⚠️ **No sheet and no two-screen review/payment split exist to "restructure."** This ticket *introduces*
  a sheet where there was a full screen + a separate `/settle/done` screen. Framed as such, it still fits
  "no new screens/routes" (a sheet is a component/state on `/settle`), but it is net-new structure, not a
  consolidation of existing screens.
- ⚠️ **"Payment method selection" is net-new mock content**, not a relocation. Per the scope contract,
  keep it mocked (canned methods, no real payment). Confirm scope: minimal ("Pay" = confirm button) vs. a
  mock method picker.
- ⚠️ **`BottomSheet` fit.** The existing `BottomSheet` is a **full-height Trip-Hub sheet** that renders
  its own `StatusBar` + `NavHeader` + `X` + `HomeIndicator`. A settle "confirm" sheet is a shorter,
  partial-height sheet over `/settle`. Reusing it may require a height/chrome variant rather than a
  drop-in — verify before assuming reuse; extend the shared component rather than forking a bespoke sheet.
- **Interacts with Tickets 1 & 3:** all three touch `SettleUpScreen`'s footer/settle path. Land in a
  known order (suggest 3 → 2 → 1) or expect merge coordination.

---

## Ticket 3 — Visually disabled Settle CTA until the settle math is valid

**Priority:** P1 — Settle up (screen 9); prevents confirming an unresolved/invalid settlement.
**Type / Branch:** feat — `feat/<#>-settle-cta-disabled-state`

### Components affected
- `src/components/ui.tsx` `Button` + `ui.module.css` (`.btn:disabled`, `.btnPrimary:disabled`).
- `src/screens/SettleUpScreen.tsx` (gates the footer button).
- `src/styles/tokens.css` + `DESIGN.md` (new disabled/neutral role — see below).

### Current behavior
The footer **"Confirm & settle"** `Button` has no disabled state — always enabled, always dispatches on
tap. `Button` *does* support the native `disabled` attribute, styled only as `opacity: 0.45` (plus
`box-shadow: none` on primary). No semantic disabled color; nothing gates the tap.

### Target behavior
The CTA renders in a **genuinely disabled visual state** (not merely an inert handler) until the settle
computation is resolved and valid, then becomes active. The disabled look uses the **neutral/disabled
token**, explicitly **not** error red (compare the greyed `$0.00` Confirm in IMG_6409). Matches the
reference's grey-until-ready CTA.

### Acceptance criteria
- [ ] While the gate condition is unmet, the CTA is visibly disabled (neutral fill, reduced affordance)
      *and* non-interactive (`disabled` attr + `aria-disabled`), not just a no-op onClick.
- [ ] Disabled styling uses neutral/disabled tokens — no `--color-owed`/error red, and the amber money
      role is not repurposed for "disabled."
- [ ] When the gate clears, the CTA returns to the standard primary style and dispatches `SETTLE`.
- [ ] The gate condition is defined and documented in the PR (see dependency note — the math is
      synchronous today, so "until it resolves" needs a real trigger).
- [ ] `npm run build` + `npm run typecheck` pass; driven on-screen (show both the disabled and enabled
      states).

### Token / state dependencies
- **Tokens:** introduce a disabled/neutral CTA role. Cleanest is a new pair, e.g. `--color-disabled`
  (fill, likely `--color-surface-neutral`) + `--color-on-disabled` (label, likely `--color-text-muted`),
  so `.btn:disabled` stops relying on a bare `opacity`. **Global note:** `.btn:disabled` is shared by
  every `Button` in the app (e.g. a future "Send poll" empty state), so this improves consistency
  everywhere — intended, but call it out since it's not Settle-Up-only.
- **State:** `derived.transfers`/`balances` are **synchronous and always resolved**, so there is no
  natural async "computing" window. Define the gate as a **real invariant**, e.g. disable when
  `transfers.length === 0` (nothing to settle) or when balances don't net to zero (guard against a bad
  assignment), rather than faking a spinner. If a deliberate "computing…" beat is wanted for the
  differentiator, that's an explicit added state — flag it, don't imply it.

### DESIGN.md impact
**Yes — land in DESIGN.md + tokens.css *before/with* the component change.** Per `CLAUDE.md`, a new
visual value is a new token in `DESIGN.md` + `tokens.css`, not an inline literal. Add a **disabled /
neutral CTA** color role to the "Color roles" table (it's currently absent) and note the disabled
`Button` treatment.

### Conflicts / flags
- ⚠️ **"Until debt consolidation math fully resolves" has no async trigger today** — the solver is
  memoized and synchronous. Pick a concrete gate (invariant-based recommended) and state it; don't
  introduce a fake latency without saying so.
- ✅ **"Not error red" is easy to honor** — there is no error/red token in the system to reach for
  anyway; the risk is misusing the amber money role, which the acceptance criteria forbid.

---

## Ticket 4 — [STRETCH / OPTIONAL] Proportional-split chip selector (even vs. by-spend)

**Priority:** P2 — differentiator; **optional, pending time budget.** Do the core three (1–3) first.
**Type / Branch:** feat — `feat/<#>-split-mode-chips`

### Components affected
- `src/screens/SplitScreen.tsx` and/or `src/screens/SettleUpScreen.tsx` (host — see flags on placement).
- New `ChipSelector` / choice-chip pattern (`src/components/ui.tsx`).
- `src/lib/settle.ts` (add an even-split computation path) and `src/state/TripContext.tsx` (a split-mode
  flag + re-derivation).

### Current behavior
Splitting is **per-item only**: `TOGGLE_ASSIGNEE` assigns each receipt line to specific people;
`computeShares` divides each line across its assignees ("by spend"). There is no mode switch, no even
split, and no percentage control. Totals recompute live on assignment changes.

### Target behavior
A chip selector to choose the split basis — **"Split evenly"** vs. **"Split by spend"** — using a
percentage-chip pattern (reference: the tip chips in IMG_6411 and the "Divide equally" dial in IMG_6410),
with **live recompute** of per-person totals on selection. Scoped as a **stretch/differentiator**,
separate from Tickets 1–3, and shipped only if time allows.

### Acceptance criteria
- [ ] A chip selector offers at least "Split evenly" and "Split by spend"; the active chip is clearly
      selected (reuse the locked selected/unselected chip affordance, not a new toggle metaphor).
- [ ] Selecting a mode recomputes every per-person subtotal live and the downstream transfers/balances
      update accordingly.
- [ ] "Split evenly" divides the eligible total equally (with the existing drift-to-payer rounding rule
      preserved); "Split by spend" reproduces today's per-item result exactly.
- [ ] Copy from `BRAND.md`; all styling via tokens; touch targets ≥44×44.
- [ ] `npm run build` + `npm run typecheck` pass; driven on-screen.

### Token / state dependencies
- **State:** new `splitMode: 'even' | 'by-spend'` (default `by-spend` to preserve current behavior) in
  `TripState`, plus an even-split branch in `settle.ts`. This touches **core money logic** and the
  reducer — the heaviest of the four.
- **Tokens:** choice-chip selected/unselected states — reuse `--color-surface-neutral`,
  `--color-text`/`--color-text-muted`, `--color-primary` for selection, `--radius-full`. No new color
  token expected.

### DESIGN.md impact
**Yes — reflect in the same PR (optional item, so with implementation).** Adds a **choice-chip / split-
mode pattern** to "Component patterns to reuse," and the "Debt consolidation logic" section (which today
documents minimum-transfer over per-item balances) needs an **even-split mode** noted alongside it.

### Conflicts / flags
- ⚠️ **Directly tensions the locked exclusion model.** `DESIGN.md` screen 8 locks per-item exclusion via
  the avatar-chip row and explicitly says **"don't invent a checkbox/toggle pattern instead."** A global
  even/by-spend/percentage mode is a *different splitting paradigm* layered over that. Resolve how the two
  coexist (e.g. even-split ignores per-item assignment; by-spend keeps it) before building — do not
  silently replace the per-item model.
- ⚠️ **"Percentage-chip" ambiguity.** Fixed-percentage chips (like the 20/23/25% tip chips) imply custom
  per-person percentages — a *third* model beyond even/by-spend. Confirm whether "percentage" means the
  even/by-spend switch (recommended, minimal) or arbitrary custom percentages (much larger). Flagged, not
  assumed.
- ⚠️ **Placement.** The request files this under Settle Up, but the split *basis* logically lives on the
  Split screen (where assignment happens); Settle Up is downstream of the computed balances. Decide host
  screen — stays within existing screens either way (no new route).
- **Blocked-by / coordinate-with:** Tickets 1–3 (shared Settle/Split surfaces and the derivation the ring
  and CTA read from).

---

## Cross-ticket notes

- **Suggested order:** 3 (token + CTA gate) → 2 (sheet + segmented control) → 1 (ring, whose green-fill
  rides the `SETTLE` trigger 2 relocates) → 4 (optional).
- **Shared surface:** 1–3 all touch `SettleUpScreen`'s footer/settle path; expect to coordinate merges.
- **DESIGN.md is touched by all four** (a new pattern and/or a new token each) — none is a pure code
  change. Tickets 1, 2, 4 reflect **with** implementation; Ticket 3's token must land **before/with** the
  component consumes it, per the `CLAUDE.md` token contract.
