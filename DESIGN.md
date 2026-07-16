# DESIGN.md — TripUp Design Spec

The design spec that governs the coded prototype. Structure is real; values marked **`TBD`** are filled
in as the hi-fi work lands (see `CLAUDE.md` → "Importing screens later"). Do not invent token values or
screen detail to fill blanks — a `TBD` staying a `TBD` is correct until the design decision is made.

> Upstream: Notion "Design MD (Working Draft)" — https://app.notion.com/p/39db7462358b81ae881ede49001cd3b7

---

## Product overview

TripUp is a group-travel coordination app for friend groups. It takes on the responsible parts of a
trip — deciding (polls), tracking (shared expenses), and settling (debt consolidation) — so the group
can stay present on the trip instead of managing it. Reference scenario: Ari, Ren, and Nic on a trip
to Lisbon, splitting dinners and wine.

## Reference device

- **Device:** iPhone 14 — **390 × 844**, no scaling.
- **Stack:** React + Vite + TypeScript.
- The app always renders inside a locked 390×844 frame; on desktop the frame is centered. No
  responsive breakpoints.

## Design tokens

The token layer is the contract components consume (`src/styles/tokens.css`). Components reference
tokens by role, never raw values. Current values in `tokens.css` are **neutral grayscale placeholders**
so the shell runs; replace them here and there together when the real system is set.

- **Type ramp:** `TBD` — sizes, weights, line-heights (e.g. display / title / body / caption / label).
- **Spacing scale (8pt):** `TBD` — the step set (e.g. 4 / 8 / 12 / 16 / 24 / 32 …).
- **Color roles (semantic):** `primary`, `success`/`settled`, `warning`/`owed`, plus neutral surface /
  text roles. Values `TBD`. Roles carry meaning — settled ≠ owed ≠ primary.
- **Corner radius scale:** `TBD`.
- **Elevation levels:** `TBD` — shadow/surface steps.

> Accessibility is a baseline, not a later pass: text and semantic colors must meet WCAG AA contrast,
> touch targets ≥ 44×44. Bake this in as tokens are set.

## Screens (from wireflow)

One entry per screen, in build order. Purpose/states are stubs until the wireflow + hi-fi are imported.

### 1. Home / trip list
- Purpose: `TBD` — entry point; the user's trips.
- Key states: `TBD`
- Notes: Ari starts here; grounds the flow in a real app rather than a single journey.

### 2. Trip detail / group view
- Purpose: `TBD` — the trip's members, itinerary, money at a glance.
- Key states: `TBD`
- Notes:

### 3. Add participant
- Purpose: `TBD` — bring someone (Ren) into the trip.
- Key states: `TBD` — likely a sheet/modal state, not a full screen.
- Notes:

### 4. Create poll
- Purpose: `TBD` — propose a decision (where to eat).
- Key states: `TBD`
- Notes:

### 5. Poll voting (live updates)
- Purpose: `TBD` — group votes; leading option updates live.
- Key states: `TBD` — vote counts updating in real time.
- Notes: One of the two strongest hi-fi candidates (state complexity).

### 6. Poll closed → itinerary updated
- Purpose: `TBD` — result resolves and writes into the itinerary.
- Key states: `TBD`
- Notes:

### 7. Log expense
- Purpose: `TBD` — record a shared cost; includes the receipt-scan state.
- Key states: `TBD` — manual entry + receipt-scan (mocked) state.
- Notes: Standout feature lives here.

### 8. Expense exclusions / balances
- Purpose: `TBD` — split a cost, excluding some participants (Ren + Nic off the wine); balances update.
- Key states: `TBD` — exclusion toggles, recalculated balances.
- Notes:

### 9. Debt consolidation / settle up
- Purpose: `TBD` — minimum-transfer settlement across the group.
- Key states: `TBD`
- Notes: The other strongest hi-fi candidate (debt logic + confirmation).

### 10. Settlement confirmation
- Purpose: `TBD` — settlement complete, everyone's even.
- Key states: `TBD`
- Notes:

## Standout feature: receipt scan

Vision-assisted expense entry — photograph/scan a receipt, auto-populate amount and split.

- **Trigger:** `TBD` — entry point within the Log expense flow.
- **Flow:** `TBD`
- **Mock approach for demo:** a canned "scan result" populates the form. **No real OCR pipeline** —
  fidelity is enough to sell the idea, scope stays to a single screen state.

## Debt consolidation logic

- **Approach:** minimum-transfer simplification across participants (fewest payments to settle all
  balances), not a full mesh of IOUs.
- **Inputs:** `TBD` — per-participant net balances derived from logged expenses + exclusions.
- **Outputs:** `TBD` — an ordered list of transfers (who pays whom, how much).
- **Where:** `src/lib/settle.ts` (currently a signed stub — implement for real when wiring screen 9).

## Mock data plan

Canonical demo data (names, amounts, restaurants) lives in `CONTENT.md` and is exported typed from
`src/data/mock.ts`, so copy and code use the same values across every screen. Do not introduce new
demo values ad hoc — add them to `CONTENT.md` first.

## Open questions / decisions pending

- Design tokens (all of the above) — pending Day 1–3 design decisions.
- Which 2 screens become the full hi-fi pair (current lean: poll voting + settle up).
- Final expense amounts — restaurant/lodging/landmark names now locked, see `CONTENT.md`.
