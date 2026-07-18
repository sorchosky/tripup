# docs/decisions.md — Decision Log

Dated record of decisions that are settled, so they don't get re-litigated. Newest at top. Keep
entries short: the decision, and why. Open questions live in `DESIGN.md` and the gap tracker in
`docs/brief.md`, not here.

---

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
