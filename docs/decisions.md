# docs/decisions.md — Decision Log

Dated record of decisions that are settled, so they don't get re-litigated. Newest at top. Keep
entries short: the decision, and why. Open questions live in `DESIGN.md` and the gap tracker in
`docs/brief.md`, not here.

---

### 2026-07-18 — Trip Hub ellipsis menu: wire the shared glass Menu to NavHeader (issue #14)

`Menu` itself needed no changes — #13 already built it generically (`MenuItemDef[]`, `tone`,
dismiss-on-outside, Escape-to-close + refocus, autofocus-first-item) so #14 could reuse it directly.
The actual gap was structural: `Fab` owns its own trigger button and can wrap it in its own
`position: relative` anchor div, but `NavHeader`'s right-side button is generic and had no such
wrapper or exposed ref for a caller to anchor a `Menu` to.

- **`NavHeader` gained an opt-in popover slot** (`ui.tsx`): `rightRef` (forwarded to the right icon
  `<button>`), `menu` (rendered next to that button inside a new `.navRightAnchor` positioned wrapper,
  same shape as `.fabAnchor`), and `rightExpanded` (drives `aria-expanded`; `aria-haspopup="menu"` is
  set automatically whenever `menu` is passed). This keeps `Menu` itself untouched and reusable — the
  popover is composed in by the caller, not hardcoded into `NavHeader` — and is fully additive, so
  every other `NavHeader` consumer (`CreatePollScreen`, `PollClosedScreen`, `SplitScreen`, etc.) is
  unaffected.
- **`TripDetailScreen`'s ellipsis** now opens a `Menu` with three actions: **Edit trip details** and
  **Delete trip** are non-destructive stubs (`onSelect: () => {}`, matching the issue's explicit
  scope — no edit-trip or delete-trip flow exists yet in the canonical 10-screen build order, so this
  is intentionally a no-op rather than inventing one); **Delete trip** uses `tone: 'destructive'`
  (existing `.menuItemDestructive` styling, no CSS change needed). **Add/edit participants** is real:
  it navigates to `/trip/add`, the already-built `AddParticipantScreen` — the concrete "sheet" the
  issue refers to. #15 (extracting a *shared* `BottomSheet` primitive from that screen's local
  scrim/sheet/grabber pattern) is separate, already-deferred scope, not a blocker here.
- **New `Edit` (pencil) icon** added to `icons.tsx` (same lucide-style/`base()` pattern as the rest of
  the set) — no edit/pencil glyph existed yet; `Trash2` and `Users` already covered the other two rows.
- Verified end-to-end with Playwright against the dev server (390×844 viewport): ellipsis opens the
  menu with the three labeled rows; outside-click and Escape both dismiss it (Escape also refocuses the
  ellipsis button, `aria-expanded` toggles correctly); "Add/edit participants" lands on
  `AddParticipantScreen`; the FAB's independent `Menu` instance on the same screen is unaffected.

### 2026-07-18 — Trip Hub itinerary: chronological, day-grouped, anchored to now (issue #12)

Rebuilt the itinerary from a flat list under a static "Itinerary" eyebrow into a real day-grouped
timeline, now that #7 locked the trip's actual dates (Jun 10–18, 2026). **Supersedes the 2026-07-17
entry's "day labels stay relative since trip dates are still TBD" framing** — every `ItineraryItem.day`
is now a real ISO date, not the placeholder literal `'Today'`.

- **Chronological, day-grouped rendering:** `src/lib/itinerary.ts` (new) exports
  `groupItineraryByDay` (days ascending, each day's items earliest → latest, `time: null` items sorted
  last as "anytime" stops) and `findAnchorId`. Per-day `Eyebrow`s (`formatItineraryDay`, `dates.ts`)
  replace the single static "Itinerary" heading; the dead `.dayLabel` CSS rule is gone.
- **Anchor-to-now:** on load, the screen scrolls to and visually emphasizes (accent border + "Up
  next"/"Most recent" label) the next upcoming item, or — once nothing's left today — the most recent
  one. Everything before the anchor reads demoted (`--opacity-demoted`, new token). Driven by a new
  `NARRATIVE_NOW` (`2026-06-17T22:00:00Z`, dates.ts) — a more granular sibling to the existing
  `NARRATIVE_TODAY` (kept untouched at midnight so Home's "1 day left" doesn't shift). Verified against
  pre-trip, mid-trip, and the demo's actual last-evening-of-trip state (anchors to the dinner, since
  nothing's scheduled after 21:00) by calling `findAnchorId` directly with each reference time.
- **Content additions:** Oceanário de Lisboa added to `CONTENT.md`'s Landmarks (real address/
  coordinates/phone, web-verified rather than invented) and to `LANDMARKS` in `mock.ts`, placed on a
  mid-trip day. One breakfast (Hygge Kaffe) and one lunch (Tapa do BairroAlto) stop — both already
  locked in CONTENT.md's "Itinerary options" — are now seeded on the narrative day (Jun 17) ahead of
  the dinner, demonstrating the breakfast → lunch → dinner clock ordering within a day. A new
  `## Itinerary` section in `CONTENT.md` documents the resulting locked day-by-day sequence.
- `CLOSE_POLL`/`SETTLE` in `TripContext.tsx` are unchanged — they already mutate `state.itinerary` by
  id (append / status flip) rather than relying on array order, so render-time grouping/sorting doesn't
  disturb them; verified by driving vote → close poll → split → settle end-to-end against the new
  timeline.

### 2026-07-18 — Split the bill: capture-receipt flow, glass footer, drop review warning (issue #19)

`SplitScreen` no longer opens directly into the pre-populated receipt — it now walks the mocked
capture flow the wireframe annotations describe (`docs/wireframe-handoff.md` §3, node `29:2391`):
empty state → mocked camera view → skeleton loading → the existing populated itemized list. All
screen-local (`useState`), not routed through `TripContext`, since it's view-state for a mocked
capture, not one of the graded reducer transitions.

- **Ellipsis replaces the top-right `X`**, matching the (currently inert, no menu wired yet)
  ellipsis pattern already on `TripDetailScreen` — consistent placeholder, not this issue's job to
  build #14's actual menu.
- **`needsReview` / "tap to fix" warning row removed** from item rows entirely, per the issue — no
  replacement tap/swipe-to-edit interaction built here (flagged as a follow-up design pitch). The
  `needsReview` field stays on `ReceiptItem`/`DINNER_RECEIPT` in `mock.ts`, just unused by this
  screen now.
- **"Add item manually" is now a bottom sheet** (local to `SplitScreen`, following the same
  scrim/sheet/grabber pattern `AddParticipantScreen` already uses locally, since #15's shared
  `BottomSheet` component hasn't landed yet). The sheet's fields are real inputs, but submitting just
  closes it — real manual-entry persistence (and the settle-up math it would feed) is out of scope
  here, same spirit as the receipt scan itself being mocked.
- **`Screen` gained an opt-in `floatingFooter` prop** (`Screen.tsx` + `.module.css`): the footer
  overlays the scroll area instead of stacking below it in flex flow, so `.glass`'s backdrop blur
  actually has scrolled content behind it — verified visually (the wine line's price shows through the
  blurred footer). Also suppresses `HomeIndicator` while active, since the floating bar replaces its
  margin. Scoped as an opt-in prop rather than a global change, so `SettleUpScreen`/`CreatePollScreen`/
  `PollVotingScreen` footers are unaffected. Split's footer only floats in the `populated` stage (no
  footer at all in the empty/capture/loading stages).
- **`bleed` content now stretches to fill the scroll area** (`Screen.module.css`'s new `.bleedFill`,
  flex column + `flex: 1 0 auto` on its single child) instead of collapsing to its own content size —
  needed so the full-bleed mocked-camera view can vertically center within the real available space.
  Verified this doesn't regress `PollClosedScreen`/`SettlementConfirmationScreen`, the other two
  `bleed` screens, via screenshot diff.

### 2026-07-18 — Trip Hub chrome: shared tab bar + glass FAB (issue #13)

Replaced the single evolving footer CTA on the Trip Hub with the shared `TabBar` (already mounted per
#8) plus a right-side glass `Fab`, per the issue. Removing that CTA also removed the only way the hub
itself advanced the linear poll→split→settle journey, so this pass restores the lost entry points
with affordances native to the hub rather than reintroducing a single CTA:

- **`Fab`** (`ui.tsx`) — round glass button, reuses `.glass`/`--blur-glass`; opens a **`Menu`** (glass
  popover, dismiss-on-outside via `pointerdown`, Escape-to-close + refocus, autofocuses the first
  item). `Menu` is written generically (`MenuItemDef[]`, `tone: 'default' | 'destructive'` already
  modeled) so #14's ellipsis action menu can reuse it directly instead of building its own.
- **FAB actions:** "Create a poll" → `/poll/new` (unchanged route). "Add to itinerary" → dispatches a
  new generic `ADD_ITINERARY_ITEM` action (idempotent, same guard shape as `CLOSE_POLL`'s itinerary
  write) with `COFFEE_STOP_ITINERARY_ITEM`, a real stop sourced from `CONTENT.md`'s already-locked
  coffee options (that section was explicitly flagged there as "available for screen 2 ... or future
  extension" — this is that extension, not an invented venue).
- **Layout:** `TripDetailScreen` composes `TabBar` (flex, center) + `Fab` (fixed, right) in one row
  passed into `Screen`'s existing `tabBar` slot — `Screen.tsx` itself untouched.
- **Restoring lost navigation:** an open poll (`poll.status === 'open'`) now surfaces as a tappable
  banner above the itinerary, routing back to `/poll`. A `pending` itinerary row (the dinner, once the
  poll closes) is now tappable, routing to `/split`. Together with the FAB's "Create a poll," this
  keeps `/poll`, `/split`, `/settle` all reachable from the hub with the footer CTA gone — driven
  end-to-end with a headless-Chromium pass (menu open/close, both FAB actions, poll-open revisit,
  pending-item → split).
- **"Add Ren" via the ellipsis stays dead**, unchanged from before this issue — wiring it is #14/#15's
  scope (the ellipsis menu + add-participant sheet), not this one's.

### 2026-07-18 — Home hero restyled to spec (issue #9)

`TripCard`'s extraction (hero/row variants) had already shipped in an earlier pass, but the hero's
visual details still lagged issue #9's scope. This pass finishes the restyle without touching
`mock.ts`, tokens, or the tab bar — all of that groundwork (#7, #8) was already in place.

- **"This trip" eyebrow removed** from `HomeScreen` above the hero card.
- **Status pill moved on-card, top-left**, replacing the old map-pin + destination-text badge
  (`TripCard.tsx`'s `.map` block); the destination is still implied by the skyline art and title.
- **Subline trimmed** to dates + "N day(s) left" only — spend moved out of the sentence and into the
  footer.
- **Footer swapped**: "{n} in the group" + chevron removed; the two-avatar group now sits alongside
  the formatted group spend (`spendCents`, via the existing `formatSpend` helper).

### 2026-07-18 — Data & content model: dates/status/spend locked, avatars, extra trips (issue #7)

**Approved override of the "no fabricated trips/dates" stance** (issue #7): Lisbon's dates were the
last major `TBD` left after the 2026-07-16/17 content locks, and Home's "Past trips" empty state and
hardcoded "Live" pill were placeholder debt blocking #8–#15. Per the issue author, this pass
deliberately fabricates dates/trips that were previously kept honest-and-empty, so screens have real
data to read from. Docs (`CONTENT.md`) are updated in the same pass rather than left contradicting
the code.

- **Lisbon dates locked:** Jun 10–18, 2026. `TripStatus` (`'live' | 'upcoming' | 'past'`) added to the
  trip type, replacing HomeScreen's hardcoded `<Pill tone="settled">Live</Pill>` JSX.
- **Date helpers added** (`src/lib/dates.ts`): `formatDateRange` and a deterministic `daysLeft`,
  computed against a fixed `NARRATIVE_TODAY` (2026-06-17) rather than the real clock — the flow
  already narrates around that date (the dinner receipt, itinerary "Today" labels), so days-left
  needed to stay pinned to it, not drift with wall-clock time.
- **`spendCents` added** to the trip type — Lisbon's is the dinner receipt total (€108.00); real,
  derived from existing mock data, not invented.
- **Two more trips added to Home's list — summary-level only:** Tokyo (upcoming, Oct 3–12, 2026;
  roster: Ari + Josie) and Paris weekend (past, Mar 13–15, 2026; roster: Ari + Michael + Genevieve).
  Josie/Michael/Genevieve are new participants, scoped to these two trips only. Paris's €540.00 spend
  figure is a newly-authored placeholder amount, flagged in `CONTENT.md` for review. **No itinerary/
  poll/expense flow exists for Tokyo or Paris** — `TripContext` still tracks Lisbon as the one active
  trip; the other two are non-interactive cards on Home. Expanding them into full flows is out of
  scope here (not in issue #7's file list, and #8–#15 are all Lisbon-flow tickets).
- **Avatar photos:** `Participant.avatarUrl?` added; `Avatar` renders an `<img>` when present, falling
  back to initials otherwise. Only Ari has one (per the issue) — a placeholder gradient-silhouette SVG
  (`src/assets/avatar-ari.svg`), not a real photo (egress blocked here); Ren/Nic (and the new Josie/
  Michael/Genevieve) stay on the initials fallback.
- **Asset pipeline stood up:** `src/assets/` now holds `skylines.tsx` (per-destination gradient/
  line-art SVGs replacing the one inline Home hero graphic) and `avatar-ari.svg`. All marked as
  placeholders in code comments, standing in for real stock photography to be dropped in later.
- **`--blur-glass` token added** (`tokens.css`), replacing the hardcoded `blur(20px)` in `.glass`
  (`ui.module.css`) — reusable by #8 and #13 per the issue.
- `src/components/README.md` corrected — it still described the component set as "currently empty by
  design," which has been stale since the 2026-07-17 build pass.

### 2026-07-17 — First pass of the coded flow built (all 9 routes)

The skeleton is now a working prototype. Ari's Lisbon journey plays end to end and every graded state
change fires through the shared `useReducer` store (`src/state/TripContext.tsx`).

- **Screens 7 + 8 fused** into one `/split` "Scan & assign" screen, matching the hi-fi mock's two-step
  "Scan & assign · Settle up" framing (this resolves the DESIGN.md open question). Settle-up is the
  second step at `/settle`. Net flow is 9 routes, under the ≤10 budget.
- **Single-user Ari POV.** No "view as Ren" toggle; the participant-POV wireframe frames
  (`ren-poll-notification`, `ren-your-share`) are not built. The story reads from Ari's seat; poll
  voting still animates Ren/Nic's votes arriving live, and settle-up shows who-pays-whom.
- **Both hi-fi screens ported faithfully** (`PollClosedScreen`, `SplitScreen`) — verified against the
  Figma via headless-Chromium screenshots. The winner-card photo is a warm CSS-gradient placeholder
  (the Figma image asset isn't in the repo and the egress policy blocks fetching it); flagged as a
  stand-in, not invented content.
- **Real debt logic** implemented in `src/lib/settle.ts` (per-item cent splitting with drift-to-payer
  + greedy min-transfer). Output matches the hi-fi footer (Ari €57.34 · Ren €25.33 · Nic €25.33) and
  the "two transfers close it out" narrative, and recomputes live as per-item exclusions toggle.
- **Trip starts with Ari + Nic**; Ari adds Ren on screen 3 (the 2→3 avatar transition). Roster is kept
  in canonical A · R · N order for display.
- **Type system loaded** via Google Fonts (Bricolage Grotesque + Hanken Grotesk) in `index.html`.
- **Honest placeholders kept visible:** Home's "past trips" is an empty state (no invented trips);
  the itinerary is seeded only from CONTENT.md's real Lisbon places; trip dates stay TBD (day labels
  are relative). No fabricated names/amounts/dates were added to make screens look finished.
- Component set built in `src/components/` (chrome, avatar/pill/button primitives, icons) consuming
  tokens by role; new glass/avatar/tracking tokens added to `tokens.css` + DESIGN.md's token notes.

### 2026-07-17 — Hi-fi mocks landed; visual design tokens locked
- Two screens drafted at high fidelity in Figma (`poll-status-and-reveal`, `receipt-capture-itemize`)
  are now the **source of truth for visual design** — see `DESIGN.md` → "Visual design reference
  (hi-fi mocks)". Figma: node `29:2972` in "Steve Orchosky — Bending Spoons Design Task."
- Real palette, type (Bricolage Grotesque display / Hanken Grotesk body), radii, and shadow/elevation
  values replace the neutral-grayscale placeholders in `DESIGN.md` and `src/styles/tokens.css`.
- Screens 7 and 8 (log expense, exclusions/balances) read in the mock as one fused "Scan & assign" step
  with a 2-step indicator ("Scan & assign · Settle up") — flagged as an open question whether to build
  them as one routed screen or two screens sharing the step-indicator component.
- Mock data (venue names, poll result, receipt line items, per-person subtotals) sourced from the mocks
  into `CONTENT.md`, replacing several `TBD`s. No 4th participant needed.
- The poll's Question/Options/Result are now resolved by this same hi-fi mock (Cervejaria Ramiro wins,
  2 votes), which supersedes the placeholder 3-venue candidate list from 2026-07-16 below.

### 2026-07-16 — Real Lisbon venue & lodging data locked
- **Lodging, 2 landmarks, and dinner/lunch/coffee/breakfast options are now real, named Lisbon
  places** (address, lat/lng, rating, phone) — see `CONTENT.md`.
- **Belém Tower is closed for restoration** as of early 2026 per recent reviews — kept as a landmark
  stop, noted as a caveat rather than dropped.
- The dinner-poll candidate list drafted in this pass (A Nossa Casa, Taberna Sal Grosso, Black Pavilion
  Restaurant) was **superseded the same day** once the hi-fi poll mock landed (see entry above) — the
  mock's own three venues (Cervejaria Ramiro, Time Out Market, A Cevicheria) are what's locked in
  `CONTENT.md` now. The "Trattoria wins, 4 to 2" line in `BRAND.md` is illustrative tone copy, not
  literal screen copy — left as-is, but note the real result reads "Cervejaria Ramiro, 2 votes."

### 2026-07-16 — Repo framework scaffolded (this pass)
- **Local MD files are the source of truth** in the repo (mirrored from Notion), so the design intent
  travels with the code and is readable at generate-time. Notion remains upstream/narrative.
- **Stack: React + Vite + TypeScript.** TS for engineering-judgment signal and safer refactors.
- **Token layer via CSS custom properties** (`src/styles/tokens.css`) — makes the token system literal
  and visible; components consume roles, never raw values.
- **React Router** for the screen flow; **React Context + `useReducer`** for shared trip state (no
  extra state-management dependency for a demo).
- Placeholder token values are neutral grayscale, clearly marked — the shell runs without faking the
  real brand palette.
- `docs/brief.md` authored as an evaluator-facing **QA/scoring rubric**, used in-loop each iteration.

### Earlier (from project planning — carried from Notion)
- **Reference device: iPhone 14, 390×844, no scaling.**
- **Standout feature: receipt scan** (vision-assisted expense entry), **mocked** for the demo — one
  screen state, no OCR pipeline.
- **Debt consolidation: minimum-transfer** simplification (fewest payments), implemented as real code
  when built — not just a visual mock.
- **Slogan: "Decide fast, stay in the moment."** Brand voice locked (see `BRAND.md`).
- **Deploy target: Vercel.**

### Pending (not yet decided — tracked elsewhere)
- ~~Design token values~~ — locked, see `DESIGN.md`.
- ~~Which 2 screens become the hi-fi pair~~ — decided: poll closed/reveal + receipt-scan/assign, see
  `DESIGN.md`.
- ~~Final mock-data values~~ — restaurant/lodging/landmark names and dinner amounts now locked, see
  `CONTENT.md`. Trip dates still `TBD`.
- Whether screens 7/8 merge into one routed screen or stay separate with a shared step indicator — see
  `DESIGN.md` → "Open questions."
