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

## Visual design reference (hi-fi mocks) — SOURCE OF TRUTH

> Figma: [Steve Orchosky — Bending Spoons Design Task](https://www.figma.com/design/opM4qfaNmCgOTiBlteUcMS/Steve-Orchosky---Bending-Spoons-Design-Task?node-id=29-2972), frame `Hi-fidelity mocks` (node
> `29:2972`). Logged 2026-07-17. **This section is the reference point for any future visual-design
> question** — check here before inventing a value.

Two screens are drafted at high fidelity and establish the real look and feel for the whole app. Every
other screen should read as a sibling of these two, not a departure.

1. **`poll-status-and-reveal`** (node `29:2750`) — covers screen 6, "Poll closed → itinerary updated."
   Poll header with a `Poll closed` status pill + close time, a "Winner" card (photo, venue name,
   category/distance/price, a confirmation row — "Added to Lisbon 2026"), then a ranked results list
   (`RESULTS · 3/3 VOTED`) with numbered avatars and vote counts.
2. **`receipt-capture-itemize`** (node `29:2783`) — covers screen 7 (Log expense / receipt-scan) fused
   with the assignment part of screen 8 (exclusions). Framed as a 2-step flow, **"Scan & assign · Settle
   up"**. Shows the captured receipt (thumbnail + merchant/date/total), an itemized list where each line
   has a quantity, name, price, and "Assigned to" avatar-chip row (filled navy chip = assigned, outlined
   chip = excluded — this is how exclusion reads visually), an inline warning affordance for an
   OCR line that needs review, "+ Add item manually," and a sticky footer with live per-person subtotals
   and a primary CTA.

Both screens share a consistent system, described below. Treat every value here as **locked**, not
placeholder — it supersedes the neutral-grayscale defaults that used to be in this section.

### Color roles

| Role | Value | Used for |
| --- | --- | --- |
| `primary` | `#5a45d6` (indigo/violet) | Primary buttons (`Review split`), primary CTA shadow `rgba(90,69,214,0.24)` |
| `surface` (app background) | `#f6f6f4` | Screen/device background — warm off-white, not pure white |
| `surface-raised` (cards) | `#ffffff` | Cards: winner card, receipt card, item rows |
| `surface-neutral` (chips/inactive) | `#efede7` | Inactive avatar chips, retake button, results rank badge (2nd/3rd place) |
| `border` (hairline) | `#e6e1d7` | Card borders (0.5px), row dividers — warm, not cool gray |
| `text` (ink, primary) | `#16192a` | Headlines, primary body text, filled avatar chip fill |
| `text-muted` (secondary) | `#565b7b` | Meta text, secondary labels, eyebrow labels, non-leading result rows |
| `settled` / `success` | `#0e7a5f` on `rgba(14,122,95,0.1)` bg | "Poll closed" pill, "Added to Lisbon 2026" confirmation row |
| `owed` / `warning` | `#8a5a08` text on `#fef6da` bg, border `rgba(212,169,71,0.4)` | Inline receipt-line warning ("This price needs a second look") |
| avatar unassigned outline | border `#d8d2c6`, text `#565b7b`, fill `#ffffff` | Excluded/unassigned participant chip |
| avatar assigned fill | bg `#16192a`, text `#ffffff` | Assigned participant chip (initials) |
| `disabled` / neutral CTA (issue #41) | `--color-disabled` (= `surface-neutral` `#efede7`) fill, `--color-on-disabled` (= `text-muted` `#565b7b`) label | `Button`'s `:disabled` state, app-wide — a real neutral, not a dimmed-opacity primary/neutral button and never the `owed`/amber warning role. Reserved for a genuine unmet invariant (e.g. Settle Up's CTA before `derived.transfers` resolves to something to confirm), not a loading spinner stand-in. |

Semantic roles hold: `settled` (green) is never reused for `primary` (indigo) or vice versa, and the
warning amber is distinct from both. Carry these exact roles into `tokens.css`, not the raw hex, inside
components.

### Typography

Two-family system:
- **Display / headline — Bricolage Grotesque.** ExtraBold, 26px, tracking -0.52px, line-height 1.12 for
  page titles ("Where should we eat tonight?", "Split the bill"). Bold, 20px, tracking -0.2px for card
  titles (winner card venue name).
- **Body / UI — Hanken Grotesk.** Full weight range used deliberately by hierarchy level:
  - ExtraBold 12px, uppercase, tracking ~0.72–1.08px, color `text-muted` — eyebrow/section labels
    (`RESULTS · 3/3 VOTED`, `ITEMS`, `CAPTURED RECEIPT`, pill labels).
  - Bold 16px `text` — item names, leading result row, receipt merchant name.
  - SemiBold/Medium 13–16px `text-muted` — non-leading rows, step indicator inactive state, "Retake."
  - Regular 14px `text-muted` — meta/secondary lines (receipt date, "Assigned to" label).

### Corner radius

- `999px` — pills, avatar chips (fully round).
- `44px` — the device frame itself, and the glass footer bar (matches frame radius — footer reads as
  part of the device chrome, not a floating card).
- `24px` — winner-card image/media block.
- `16px` — winner-card outer container.
- `8px` — item rows, receipt card, primary button, inline warning banner. This is the default
  "component" radius — use it unless a node above overrides it.
- `6px` — receipt thumbnail, small nested elements.

### Elevation / shadow

- **Card elevation:** `0px 4px 7px rgba(22,25,42,0.08)` — winner card.
- **Floating-glass elevation:** `0px 8px 40px rgba(0,0,0,0.12)` — nav icon buttons, sticky footer bar.
  These use a frosted "liquid glass" treatment (iOS 26 style): a `rgba(255,255,255,0.65)` white layer,
  a `color-burn` blend at `#dddddd`, and a `darken` blend at `#f7f7f7` stacked to fake refraction/frost
  over whatever scrolls beneath. Reserve this treatment for chrome that floats over content (nav bar,
  bottom action bar) — not for regular cards. Structurally, this chrome (nav header, footer bar, tab
  bar) is pinned via `position: absolute` inside the screen body, with the scrollable content area
  running full-bleed underneath — the glass must always have real scrolled content behind it to blur,
  not an opaque scroll boundary.
- **Primary-button elevation:** `0px 6px 16px rgba(90,69,214,0.24)` — colored to match the button
  (`primary`), not a neutral shadow.

### Component patterns to reuse

- **Status pill:** rounded-999px, tinted 10%-opacity background of the semantic color, bold uppercase
  12px label in the full-opacity semantic color (see "Poll closed" pill).
- **Avatar-initial chip:** 28–32px circle, single-letter initial, Bold 12px. Assigned/active = filled
  navy; unassigned/excluded = white fill with a `1.5px` `#d8d2c6` outline. This is the exclusion
  affordance for screen 8 — don't invent a checkbox/toggle pattern instead.
- **Step indicator:** small text label pairs separated by a 3px dot, active step Bold `text`, inactive
  step Medium `text-muted` (see "Scan & assign · Settle up").
- **Inline warning row:** amber-tinted banner nested *inside* an item row (not a separate toast/modal) —
  keeps the fix affordance next to the thing that needs fixing. **Dropped from the build** per design
  review (issue #19, see `docs/decisions.md`) — a replacement tap/swipe-to-edit interaction is a
  follow-up design pitch, not built yet. The `owed`/`warning` color role and `needsReview` mock field
  still exist (kept for that follow-up); only the rendered row is gone.
- **Sticky footer bar:** glass-chrome container, live per-person subtotal row (avatar chip + amount)
  above a full-width primary button.
- **Bottom sheet, partial-height variant** (issue #40, `BottomSheet.tsx`): the original `BottomSheet`
  is a full-height routed screen state (add/edit participants, #15). The `variant="partial"` chrome
  variant instead overlays the *current* screen without a route change — bottom-anchored, `max-height:
  72%`, rounded top corners only, a dismissible scrim behind it, no `StatusBar` (it doesn't cover the
  notch). Used for the Settle Up confirm flow so "Confirm & settle" opens a sheet in place rather than
  navigating away before the user has actually confirmed anything.
- **Blurred-image glow** (issue #59, `src/components/ImageGlow.tsx`): a blurred, bled-out copy of a
  photo sits behind its card, standing in for a neutral drop shadow with an ambient, photo-colored one
  (Sunday-app reference). Used on the poll-reveal winner card now that it has a real photo
  (`cervejaria-ramiro.webp`); reserved for other photo surfaces once they get real files (settle-up hero,
  issue #61). Governed by three tokens in `tokens.css` — `--glow-blur` (32px), `--glow-spread` (20px,
  how far the copy bleeds past the sharp card), `--glow-opacity` (0.55). Don't apply it to non-photo
  cards — it's a photo-specific pattern, not a general elevation replacement.
- **Segmented control** (issue #40, `ui.tsx`/`ui.module.css`): a 2/3-way tab-style switch for an
  in-place step, not a boolean toggle — `--color-surface-neutral` track, `--color-surface-raised` +
  `--color-text` active segment (with `--elevation-card` for separation), `--color-text-muted`
  inactive, `--radius-full` throughout. No new color token needed. First used by the Settle Up confirm
  sheet's Review/Pay steps.
- **Shimmer skeleton** (issue #58, `SplitScreen.module.css`): the post-capture loading moment (between
  the mocked "camera" and the populated receipt) uses a moving highlight sweep across skeleton
  placeholders — the receipt-card thumbnail/lines and three line-item skeleton rows — instead of a
  generic opacity pulse. A `100deg` linear gradient (`--color-shimmer-base` →
  `--color-shimmer-highlight` → `--color-shimmer-base`) animates its `background-position` over
  `--shimmer-duration` (1000ms, matching the mocked scan delay so the sweep completes exactly once
  before the populated state lands). `role="status"` stays on the "Reading the receipt." caption so
  the loading state is still announced to assistive tech. Base/highlight reuse the existing neutral
  surface roles rather than introducing new raw colors.

## Design tokens

The token layer is the contract components consume (`src/styles/tokens.css`). Components reference
tokens by role, never raw values. Values below are now **locked**, sourced from the hi-fi mocks above —
`tokens.css` mirrors them exactly. Anything not covered by the two hi-fi screens (e.g. a color role
never used in either mock) stays `TBD` until a screen that needs it is drafted.

- **Type ramp:** locked — see "Typography" above. Two font families (Bricolage Grotesque display,
  Hanken Grotesk body), weight-driven hierarchy rather than a large size ramp.
- **Spacing scale (8pt):** unchanged from the existing placeholder — the hi-fi mocks are consistent with
  an 8pt step set (4 / 8 / 12 / 16 / 24 / 32 …); no revision needed.
- **Color roles (semantic):** locked — see "Color roles" table above.
- **Corner radius scale:** locked — see "Corner radius" above (6 / 8 / 16 / 24 / 999 / 44).
- **Elevation levels:** locked — see "Elevation / shadow" above (card / floating-glass / primary-button
  are three distinct steps, not one generic shadow).

> Accessibility is a baseline, not a later pass: text and semantic colors must meet WCAG AA contrast,
> touch targets ≥ 44×44. `text-muted` (#565b7b) on `surface` (#f6f6f4) and `surface-raised` (#ffffff)
> should be spot-checked against AA when new combinations show up — the mocks' text/background pairings
> pass, but don't assume every future pairing will.

## Screens (from wireflow)

One entry per screen, in build order. Purpose/states are stubs until the wireflow + hi-fi are imported.

### 1. Home / trip list
- Purpose: `TBD` — entry point; the user's trips.
- Key states: `TBD`
- Notes: Ari starts here; grounds the flow in a real app rather than a single journey.

### 2. Trip detail / group view
- Purpose: `TBD` — the trip's members, itinerary, money at a glance.
- Key states: `TBD`
- Notes: The itinerary renders as an **Oura-style vertical timeline** (issue #47) — day-grouped
  (`Eyebrow` per day), each row an icon node on a connecting rail (paid = settled-tone check, planned/
  pending = a tinted pin, `pending` in the `owed` role) next to a plain tappable card (title, subtitle,
  status pill, trailing `ChevronRight`). Every row is a real, focusable button for visual/keyboard
  consistency; only rows with a real downstream screen (the dinner expense: `/split` while owed, `/settle`
  once paid) actually navigate — the rest are intentional no-op taps, same stub precedent as the trip
  menu's "Edit trip details." The hub opens **scrolled to the top**, not auto-scrolled to a "now" item —
  this supersedes issue #12's anchor-to-now scroll/demote treatment (accent border, "Up next"/"Most
  recent" label, demoted opacity on earlier rows), which is fully removed. See `docs/decisions.md`.

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
- Purpose: **Hi-fi drafted** (`poll-status-and-reveal`, see "Visual design reference" above) — result
  resolves, shows the winner, and confirms it wrote into the itinerary.
- Key states: closed-poll header (pill + close time), winner card with confirmation row, ranked results
  list with vote tallies (`3/3 voted`).
- Notes: Build this screen directly from the hi-fi reference — tokens, type, and component patterns are
  locked, not TBD.

### 7. Log expense
- Purpose: **Hi-fi drafted**, fused with screen 8 (`receipt-capture-itemize`, see "Visual design
  reference" above) — captured receipt + itemized list in one "Scan & assign" step.
- Key states: captured-receipt summary card, per-item rows (qty/name/price), inline OCR-review warning
  on a line, "+ Add item manually."
- Notes: Standout feature lives here. The hi-fi mock frames this and screen 8's assignment step as a
  single 2-step flow ("Scan & assign · Settle up") — consider merging 7/8 into one screen with a step
  indicator rather than two separate screens, to match what's drafted.

### 8. Expense exclusions / balances
- Purpose: **Hi-fi drafted** as part of screen 7's "Scan & assign" step — exclusion happens per-item via
  the "Assigned to" avatar-chip row, not a separate exclusions screen. Sticky footer shows live
  per-person subtotals.
- Key states: filled avatar chip = assigned, outlined chip = excluded (this *is* the exclusion toggle —
  no separate checkbox pattern); footer subtotals recalculate per assignment.
- Notes: See screen 7 note above re: merging into one flow.

### 9. Debt consolidation / settle up
- Purpose: Built from the "Settle Up (Ari)" wireframe (`docs/wireframe-handoff.md`) — a payer-
  perspective hero ("you're owed") plus the minimum-transfer per-debtor breakdown from
  `src/lib/settle.ts`.
- Key states: CTA disabled until the settle math resolves to something real (`transfers.length === 0`
  or already `state.settled`, issue #41); tapping "Confirm & settle" opens a partial-height confirm
  sheet (issue #40, not a route) with a Review/Pay segmented control — Review recaps the same
  transfer rows as the main screen, Pay holds a mocked payment-method choice and the button that
  actually dispatches `SETTLE`.
- Notes: The other strongest hi-fi candidate (debt logic + confirmation).

### 10. Settlement confirmation
- Purpose: Payoff screen after `SETTLE` fires from the confirm sheet's Pay step — settlement complete,
  everyone's even. Still the post-confirm destination (`/settle/done`, issue #40 kept the existing
  route rather than showing success inline in the sheet, so the recap gets its own full screen instead
  of being squeezed into the partial-height sheet).
- Key states: transfer recap (same solver output), single CTA back to the trip.
- Notes:

### 11. Activity feed
- Purpose: Cross-cutting hub, added per issue #57 — surfaces the active poll (and who's responded) plus
  outstanding settle-up requests, so the Activity tab actually goes somewhere instead of staying a
  disabled placeholder. **Deliberately exceeds the ≤10-screen budget above** — the user asked for this
  override explicitly (issue #57), since Activity is the destination for #55 and ties the poll → split →
  settle journey together. Flagged here rather than silently folded into the "≤10 screens" count.
- Key states: computed digest, not a persisted event log — sections appear/disappear as
  `state.poll.status`, `state.itinerary`, `derived.transfers`, and `state.settled` change: open poll +
  per-participant vote rows, decided-poll result, outstanding settle-up requests, settled confirmation.
- Notes: Reuses existing tokens/components only (`Pill`, `Avatar`, `Eyebrow`, the card/elevation system)
  — no new primitives. Reachable from the Activity tab (`TabBar`), which is now route-aware rather than
  a static, disabled placeholder.

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

- ~~Design tokens~~ — **locked**, see "Visual design reference" above.
- ~~Which 2 screens become the full hi-fi pair~~ — **decided**: poll closed/reveal (screen 6) and
  receipt-scan/assign (screens 7–8, fused). See "Visual design reference" above.
- Whether screens 7 and 8 formally merge into a single routed screen (with a step indicator) to match
  the hi-fi mock, or stay separate screens that share the step-indicator component — pending.
- ~~Final restaurant names and expense amounts~~ — dinner (Cervejaria Ramiro) and poll result locked
  from the hi-fi mocks; lodging, landmarks, and lunch/coffee/breakfast options locked separately — all
  in `CONTENT.md`. Trip dates remain `TBD`.
