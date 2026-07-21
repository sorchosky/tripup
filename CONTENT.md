# CONTENT.md — Canonical Mock Data

One source of truth for the demo data used across every screen and in code, so copy (`BRAND.md` voice)
and implementation (`src/data/mock.ts`) never disagree. Real content only — **no lorem ipsum**, English
only. Values marked **`TBD`** are locked before the screens that need them are built; don't invent
amounts or names ad hoc elsewhere — add them here first.

> Feeds: `src/data/mock.ts` (typed export). Referenced by `DESIGN.md` (mock data plan).

---

## The trip

- **Destination:** Lisbon
- **Trip name:** Lisbon 2026 (per the poll-screen confirmation: "Added to Lisbon 2026")
- **Dates:** **Jun 10–18, 2026** (locked)
- **Status:** `live` — the flow's fixed narrative "today" is **Jun 17, 2026** (the day the Cervejaria
  Ramiro dinner is logged), which lands 1 day before the trip ends → "1 day left."
- **Group spend so far:** €108.00 (= the dinner receipt total, `DINNER_RECEIPT.totalCents`)

> **Note:** locking these dates, plus the Tokyo/Paris trips and their dates below, is a deliberate,
> approved override of this doc's earlier "no fabricated trips/dates" stance — see
> `docs/decisions.md` (2026-07-18 entry).

## Other trips

Home's trip list beyond Lisbon — summary-level only (thumbnail, status, dates, spend, roster). No
itinerary/poll/expense flow is built for these; they exist to make Home read as an app with more than
one trip in it.

| Trip | Destination | Status | Dates | Roster | Group spend |
| --- | --- | --- | --- | --- | --- |
| Tokyo | Tokyo | `upcoming` | Oct 3–12, 2026 | Ari, Josie | €0.00 (nothing logged yet) |
| Paris weekend | Paris | `past` | Mar 13–15, 2026 | Ari, Michael, Genevieve | €540.00 (proposed — flagged below) |

- **Josie, Michael, Genevieve** are new participants introduced for these two trips (not part of the
  Lisbon scenario). Added to the Participants table below.
- **Paris weekend's €540.00 total is a newly-authored mock value**, not sourced from a hi-fi mock or
  prior decision — a plausible weekend total (lodging + food) across 3 people, picked to make the
  "past trip" card read as real. Flag for review/replacement rather than treating as settled fact.

## Lodging

- **Name:** Dear Lisbon - Gallery House
- **Type:** Boutique hotel
- **Neighborhood:** São Bento
- **Address:** R de S. Bento 31, 1200-815 Lisboa, Portugal
- **Coordinates:** 38.710795, -9.152734 · **Rating:** 4.6 · **Phone:** +351 932 210 150
- **Notes:** Central, walkable to Bairro Alto and Chiado; ~15–20 min to Belém by train from Cais do
  Sodré/Santos. "The house" the group returns to in the scenario.

## Landmarks

| Name | Category | Address | Coordinates | Rating | Phone | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Belém Tower | Landmark | Av. Brasília, 1400-038 Lisboa, Portugal | 38.6915837, -9.2159773 | 4.5 | +351 21 362 0034 | UNESCO riverfront monument. Closed for restoration as of early 2026 per recent reviews — still a valid photo/itinerary stop; flag the closure if a screen implies visiting the interior. |
| Pastéis de Belém | Bakery | R. de Belém 84-92, 1300-085 Lisboa, Portugal | 38.6975105, -9.2032276 | 4.6 | +351 21 363 7423 | The original pastel de nata bakery (1800s), by Belém Tower — good quick-bite filler between attraction and dinner. |
| Oceanário de Lisboa | Landmark | Esplanada D. Carlos I, 1990-005 Lisboa, Portugal | 38.7635435, -9.0937415 | 4.6 | +351 218 917 002 | Aquarium in Parque das Nações — one of Europe's largest, a strong mid-trip day activity distinct from the Belém/dinner cluster. Added for issue #12's multi-day itinerary. |

## Participants

The reference group from the scenario. Ari is the Organizer; Ren and Nic are Participants. Confirmed
by the hi-fi mocks — no 4th participant appears (avatar rows are consistently Ar / Re / Ni, per
issue #98's two-initial fallback).

| Name | Role | Notes |
| --- | --- | --- |
| Ari | Organizer | Sets up the trip, the "you"/primary user in most flows. Renders as a two-initial avatar like everyone else (see Avatars below); organizer/POV on all three trips. |
| Ren | Participant | Shows up hangry (poll-notification reference); manually deselected from the wine split |
| Nic | Participant | Manually deselected from the wine split |
| Josie | Participant | Joins the Tokyo trip (upcoming) — not part of the Lisbon scenario |
| Michael | Participant | Joins the Paris weekend trip (past) — not part of the Lisbon scenario |
| Genevieve | Participant | Joins the Paris weekend trip (past) — not part of the Lisbon scenario |

### Avatars

All participants — Ari included — render as a two-initial fallback (the `Avatar` component's
default): the first two letters of the name for single-name participants (Ar / Re / Ni / Jo / Mi /
Ge), or first+last initial where a surname exists. No participant currently carries an `avatarUrl`.

Issue #98 overrides #59 (the photorealistic-images super-ticket, which had deliberately given Ari a
placeholder photo avatar to demonstrate the photo/fallback pairing). Per #98's explicit instruction,
that pairing is retired: Ari's `avatarUrl` was removed from `src/data/mock.ts` so Ari renders initials
app-wide, matching everyone else, and reads clearly on the receipt/settle-up rows. The unused
`src/assets/avatar-ari.svg` file is left in place (nothing else references it) but is no longer wired
into any component.

> Debt consolidation reads fine with 3 people given the confirmed expense set below (~2 transfers to
> settle). No 4th participant needed — the hi-fi mocks settle this.

### Suggested participants (Add/edit participants sheet)

With an empty search query, the Add/edit participants sheet (screen 3) surfaces up to 3 people not
already on the trip under a "Suggested" eyebrow, so the sheet isn't empty until someone types. The
suggested set is just the existing roster (`ALL_PARTICIPANTS`) filtered to whoever isn't on the trip
yet, in table order above — no new names invented for this. Starting from Ari + Nic on the trip, that's
Ren, Josie, Michael (Genevieve falls past the 3-person cap). Typing a query still filters that same
roster by name prefix, also capped at 3 results.

### Photo assets (issue #59)

Real user-supplied photos, dropped into `src/assets/photos/`. Everything below is now a real file, not
a placeholder — the gradient/line-art SVGs and fake receipt lines they replaced are gone.

| Slot | File | Used by |
| --- | --- | --- |
| Lisbon skyline | `lisbon-skyline.jpg` | Home hero `TripCard` (`src/assets/skylines.tsx` → `LisbonSkyline`) |
| Tokyo skyline | `tokyo-skyline.jpg` | Home row `TripCard` for the Tokyo trip |
| Paris skyline | `paris-skyline.jpg` | Home row `TripCard` for the Paris weekend trip |
| Cervejaria Ramiro (dining room) | `cervejaria-ramiro.webp` | Poll-reveal winner card (`PollClosedScreen`), with the blurred-glow treatment (`ImageGlow`) — see DESIGN.md → Component patterns |
| Cervejaria Ramiro receipt | `receipt-cervejaria-ramiro.png` | Receipt capture, populated state (`SplitScreen`) |

No other image slot in the app has a supplied file — everything else (participant avatars, including
Ari as of issue #98; the settle-up hero per issue #61) stays on today's placeholder (two-initial
fallback, for avatars) per the scope contract in `CLAUDE.md` ("don't invent art").

## Expenses

Consistent expense set used across log / balances / settle-up. Sourced from the receipt on the
`receipt-capture-itemize` hi-fi mock — dinner at Cervejaria Ramiro, Lisbon, Jun 17, 21:44.

| Item | Qty | Amount | Default split | Exclusion |
| --- | --- | --- | --- | --- |
| Vinho Verde (bottle) | ×2 | €32.00 | Ari, Ren, Nic | **Ren, Nic** (manual deselect) |
| Couvert (bread & olives) | ×3 | €7.50 | Ari, Ren, Nic | — |
| Arroz de marisco | ×2 | €44.00 | Ari, Ren, Nic | — |
| Gambas à guilho | ×1 | €18.50 | Ari, Ren, Nic | — |
| Pastéis de nata | ×3 | €6.00 | Ari, Ren, Nic | — |

- **Total:** €108.00 · 5 items.
- Every line — including the Vinho Verde — starts split evenly across all three, so the exclusion
  reads as a live interaction rather than a pre-set state (issue #97). The user deselects Ren and Nic
  from the wine on-screen via the chip toggle; the app doesn't seed the exclusion for them.
- **Per-person subtotal once wine is manually excluded (as shown on the footer):** Ari €57.34 ·
  Ren €25.33 · Nic €25.33.
- One line (Vinho Verde) carries an OCR "needs a second look" warning in the mock — keep that
  affordance tied to a real line, not a decorative one-off.
- Restaurant/venue name: **Cervejaria Ramiro** (also the poll winner — same venue across the demo,
  which is what makes the flow read as one coherent trip rather than disconnected screens).

Notes:
- The **wine exclusion** (Ren + Nic deselected from the Vinho Verde line) is a graded moment — it's
  how the exclusion logic is shown, driven live by the user rather than defaulted. Confirmed in the
  hi-fi mock via the outlined (unassigned) avatar chips on the Vinho Verde row once toggled off.

## Poll

The "where to eat" decision used on screens 4–6. Sourced from the `poll-status-and-reveal` hi-fi mock.

- **Question:** "Where should we eat tonight?"
- **Options / result:** Cervejaria Ramiro (winner, 2 votes) · Time Out Market (1 vote) · A Cevicheria
  (0 votes). `RESULTS · 3/3 VOTED`, poll closed at 6:32 PM.
- **Winner card meta:** Seafood · 4 min walk · €€.
- Address/coordinates/rating/phone for these three venues aren't captured yet (unlike Lodging/Landmarks
  below) — add them here if a screen needs them.
- **AI Suggest source, superseded by the field typeahead (issue #93):** the option fields on Create
  poll used to carry a standalone "AI Suggest" chip that appended these same three venues to the list
  in one tap — framed per the wireframe annotation (29:2384) as restaurants "you and frequent
  travelers may like" pulled from past trips. That chip is gone; the same three venues now surface as
  the top 3 rows (star-marked) of a typeahead dropdown that opens on focus/typing in an option field.
  Mirrored in code as `AI_SUGGESTED_SPOTS` (derived from the options above), not hand-duplicated.
- **Typeahead venue pool (issue #93):** rows below the 3 AI picks are a broader sample of real Lisbon
  venues/landmarks, so the dropdown still has something to offer once the AI picks are exhausted or
  don't match what's typed — sourced from Landmarks (Belém Tower, Pastéis de Belém, Oceanário de
  Lisboa) and Itinerary options (Tapa do BairroAlto, Lisbon Tu e Eu, The Coffee, PUT IT ON LISBON,
  Hygge Kaffe, Breakfast Lovers Chiado) above, plus Lodging (Dear Lisbon - Gallery House). Mirrored in
  code as `LISBON_POLL_SUGGESTIONS` in `src/data/mock.ts`; `CreatePollScreen` de-dupes it against
  `AI_SUGGESTED_SPOTS` so a name never shows twice across the two groups.

> Supersedes an earlier placeholder candidate list (A Nossa Casa, Taberna Sal Grosso, Black Pavilion
> Restaurant) drafted before the hi-fi poll mock existed. The mock is the rendered screen, so it's
> authoritative — the placeholder list is dropped rather than kept as a second, contradictory "poll
> options" table. It also resolves the old "Trattoria wins, 4 to 2" reference copy: the real result is
> Cervejaria Ramiro, 2 votes, not a trattoria — update any lingering copy that still says "trattoria."

## Itinerary

The Trip Hub's locked, chronological, day-grouped timeline (issue #12) — one source for the actual
seeded sequence in `INITIAL_ITINERARY`/`DINNER_ITINERARY_ITEM` in `src/data/mock.ts`, distinct from the
"Itinerary options" candidate pool below. Dates fall inside the locked trip range (Jun 10–18, 2026);
the narrative "today" (Jun 17) is the day the dinner poll resolves, per "The trip" above.

Per issue #91, cells no longer carry a subtitle line — title + optional time only — and the rail-node
icon is now driven by `category` instead of a generic pin: `landmark`/`event` → pin, `entertainment` →
star, `breakfast` → coffee cup, `dinner` → fork-and-knife. The seed data below also uses `coffee`
(same coffee-cup icon as `breakfast`) for the FAB's quick "Add to itinerary" stop and `lunch` (same
fork-and-knife icon as `dinner`) for the midday meal — both extend the issue's four named categories
within the same closed icon set rather than inventing a fifth glyph. A `paid` item still shows the
settled check regardless of category — that "it's handled" signal stays distinct from what kind of
stop it was.

| Date | Time | Item | Category | Status |
| --- | --- | --- | --- | --- |
| Jun 10 | 15:00 | Check in — Dear Lisbon | landmark | paid |
| Jun 11 | — | Belém Tower & Pastéis de Belém | landmark | planned |
| Jun 15 | 11:00 | Oceanário de Lisboa | landmark | planned |
| Jun 17 | 08:30 | Breakfast — Hygge Kaffe | breakfast | planned |
| Jun 17 | 13:00 | Lunch — Tapa do BairroAlto | lunch | planned |
| Jun 17 | 21:00 | Dinner — Cervejaria Ramiro | dinner | written in dynamically when the poll closes (pending → paid on settle) |

Breakfast/lunch picks are one of the two locked options each from "Itinerary options" below — Hygge
Kaffe and Tapa do BairroAlto were chosen for this pass; the other two (Breakfast Lovers Chiado, Lisbon
Tu e Eu) remain available for a future extension.

## Itinerary options (lunch, coffee, breakfast)

Not tied to a specific numbered screen in the current flow (no lunch/coffee/breakfast screen exists
yet) — locked reference data available for screen 2 (trip detail/itinerary) or future extension.

**Lunch**

| Name | Vibe | Cuisine | Address | Coordinates | Rating | Price | Phone | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tapa do BairroAlto | Energetic, hidden gem | Portuguese tapas | R. da Barroca 129A, 1200-049 Lisboa, Portugal | 38.7126383, -9.1446924 | 4.9 | — | +351 963 012 182 | — |
| Lisbon Tu e Eu | Cozy, no-frills soul food | Traditional Portuguese | R da Adiça 58, 1100-116 Lisboa, Portugal | 38.7109511, -9.1300522 | 4.5 | $ | none | **Cash only per reviews** — worth flagging if used in an expense-tracking scenario. |

**Coffee**

| Name | Vibe | Address | Coordinates | Rating | Phone |
| --- | --- | --- | --- | --- | --- |
| The Coffee | Minimalist, specialty | Calçada do Duque 47, 1200-016 Lisboa, Portugal | 38.7131868, -9.142473 | 4.8 | +351 41 99279-7895 |
| PUT IT ON LISBON | Cozy, vegan and gluten-free | CC do Conde de Pombeiro 15C, 1150-099 Lisboa, Portugal | 38.7235029, -9.1370858 | 4.9 | +351 911 845 360 |

**Breakfast**

| Name | Vibe | Address | Coordinates | Rating | Price | Phone |
| --- | --- | --- | --- | --- | --- | --- |
| Hygge Kaffe | Build-your-own, minimalist Scandinavian | R. Tomás Ribeiro 95B, 1050-227 Lisboa, Portugal | 38.7315413, -9.1490725 | 4.8 | $$ | +351 931 329 691 |
| Breakfast Lovers Chiado | Bright, extensive Eggs Benedict menu | R. Vítor Cordon 26, 1200-484 Lisboa, Portugal | 38.7080494, -9.141487 | 4.9 | — | +351 939 531 673 |

## Receipt scan (mock)

Canned scan result that populates the Log-expense form — no OCR. Matches the Cervejaria Ramiro dinner
expense above, so the demo stays internally consistent.

- **Merchant:** Cervejaria Ramiro
- **Total:** €108.00 (5 items)
- **Suggested split:** even across items as itemized above; Vinho Verde starts even too, with Ren
  and Nic excluded only once manually deselected on-screen

## Settlement

Derived from the expenses above via `src/lib/settle.ts` (minimum-transfer). Not hand-authored — but the
reference copy ("Two transfers close it out") implies the final settlement resolves to ~2 transfers.
Once expense amounts are locked, confirm the algorithm's output matches that narrative and update the
copy if it doesn't.

## Activity feed (issue #57; eyebrows + settle lifecycle reworked in #104)

New surface — a computed digest of the same live trip state used elsewhere (poll, settle-up), not a
separate persisted event log. No new names/amounts; every line below reuses the Poll/Expenses/Settlement
data above. Written from `BRAND.md` (short, dry, state the fact then earn the joke).

Issue #104 replaced the old static section-label eyebrows ("Active poll", "Poll decided", "Settle up",
"Settled") with a date/time stamp on every cell, and turned the settle-up half of the feed into a real
chronological tail — poll winner → requests sent → payments redeemed — instead of two mutually-exclusive
"outstanding" / "settled" sections. The trip's narrative day is fixed at Jun 17 (`NARRATIVE_TODAY` in
`src/lib/dates.ts`), so every timestamp below is a deliberate mock constant on that date, not real
wall-clock time — same treatment the poll's `closedAt` already had.

**Active poll cell** — shown while `poll.status === 'open'`:
- Eyebrow: date-only, "**Jun 17**" — no fixed clock reading exists for individual votes in the mock
  data, so the eyebrow doesn't fabricate one (per `CLAUDE.md`'s "don't invent" rule).
- Card headline: the poll question, unchanged — "Where should we eat tonight?" — with the same
  `Pill tone="neutral"` "Poll open" label used on the Trip Detail banner (same token, same job, per C5).
- Sub-line: "{votesIn} of {totalVoters} in." — e.g. with the demo's 2 early votes: "2 of 3 in."
- One response row per participant who has voted, in vote order: "{Name} voted" — e.g. "Ari voted",
  "Nic voted." This is the "free-flowing feed of others responding" the issue asks for, entirely
  derived from `poll.options[].votedBy` — no invented timestamps or ordering beyond vote order.

**Poll decided cell** — shown once `poll.status === 'closed'` (supersedes the open-poll cell):
- Eyebrow: "**Jun 17 · 6:32 PM**" — `state.poll.closedAt`, the same locked time `PollClosedScreen`
  already shows as "Closed 6:32 PM."
- Card headline: "{Winner} wins, {winner votes} to {runner-up votes}." — with the locked result this
  reads **"Cervejaria Ramiro wins, 2 to 1."** (Real numbers, not the "Trattoria wins, 4 to 2" tone
  reference from `BRAND.md` — see the Poll section above for why that line doesn't apply verbatim.)
- Pill: reuses the exact "Poll closed" label/tone from `PollClosedScreen`, not a new variant.

**Requests-sent cell** — shown once `state.requestsSentAt` is set (the `SETTLE` action, fired by "Send
requests" on `SettleUpScreen`):
- Eyebrow: "**Jun 17 · 10:05 PM**" — `SETTLEMENT_TIMELINE.requestsSentAt` (`src/data/mock.ts`), shortly
  after the dinner receipt is logged at 21:44.
- Card: "**Requests sent.**" with a `Pill tone="neutral"` "Awaiting payment" label — the ask has gone
  out, nothing's landed back yet, so it reads as pending rather than settled/success.

**Payments-received cells** — shown once requests have been sent and there's at least one consolidated
transfer; one cell per transfer, auto-added the moment `requestsSentAt` is set (not a separate action):
- Eyebrow: "**Jun 17 · 10:12 PM**" — `SETTLEMENT_TIMELINE.redeemedAt`.
- One card per transfer: "{Debtor} paid {euros(amount)}" + a `Pill tone="settled"` "Redeemed"
  label — with the locked result this reads **"Nic paid €25.33 · Redeemed."** (the minimum-
  transfer solve on the locked expense data resolves to a single transfer, so today that's the one
  payments cell that renders — the mechanism supports more if the underlying balances ever do). The
  pill deliberately drops the payer's name (issue #157) — a name-bearing pill would vary in width per
  person.

**Empty state** — shown when none of the above apply (before any vote is cast, no expense logged yet,
no requests sent yet). Genuinely reachable — a user can tap the Activity tab the moment the app opens,
before touching the poll — so it gets real in-voice copy rather than a blank screen:
- "**Nothing moving yet.** Vote in a poll or log an expense, and it'll show up here." Same dashed-border
  empty-card treatment as `HomeScreen`'s "Nothing behind you yet." (same token, same job, per C5).
