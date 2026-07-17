# docs/wireframe-handoff.md — Wireframe Handoff Spec

**What this file is.** A one-time handoff from the Figma wireframe to code for the **first pass** at
building the app. It captures screen-state logic that isn't legible from the raw Figma layer tree —
which "screens" are actually one component in multiple states, which layers are state-driven vs.
static, and where per-item/per-user rules hide behind a flat frame. Pair it with the Figma file
itself; the frame IDs below map to Figma node IDs for cross-reference.

> **Scope: transient.** This is porting scaffolding for the initial build, not a standing contract.
> The durable contracts still live in `DESIGN.md` (tokens + screen inventory), `BRAND.md` (voice),
> and `CONTENT.md` (mock data). Where this doc and those disagree, those win. Once the first pass is
> ported and the screens exist in `src/screens/*`, this file's job is done.
>
> Source: Figma file, Bending Spoons Design Task, node **16-501**. Section numbers below are kept as
> handed off (1, 2, 3, 6) — the intervening sections weren't part of the handoff and are not invented
> here.

---

## 1. TripHub screen (participant count, menu state, pending item)

**This is one screen, not five.** The wireframe shows 5 separate frames to document different states,
but they should build as a single `TripHub` component driven by props/state, not five routes.

Frames in Figma, all named `trip-hub-lisbon`:
- 16:559
- 16:650
- 16:743
- 16:836
- 16:930

**States that vary across these frames**

Participant count
- 2 avatars (Ari, Nic) on frame 16:559
- 3 avatars (Ari, Nic, Ren) on frames 16:650, 16:743, 16:836, 16:930
- Driver: `participants` array length; avatar group renders dynamically — don't hardcode 2 or 3.

Menu overlay
- Closed on most frames.
- Open on frame 16:836, showing a `Menu - iPhone` instance and a dimmed `Tab Bar - iPhone` behind it.
- Driver: `isMenuOpen` boolean, triggered by the nav-right ellipsis icon.

Pending dinner item visibility
- The "Dinner, A Cevicheria, PENDING" timeline card (`timeline-item-2`, layer name repeats across
  frames) is marked hidden in most frames but visible with status PENDING in frame 16:743, where the
  venue also changes to "Ramiro".
- This represents an event whose reservation status hasn't been confirmed yet: the hidden state
  should surface once a reservation exists but before it's confirmed — not a random toggle.
- Driver: each timeline event has a `status` field (`paid`, `pending`); pending items render with the
  PENDING badge, paid items don't.

Home indicator / tab bar variant
- Frame 16:836 uses a shorter `Tab Bar - iPhone` (50px) plus the open `Menu - iPhone` overlay on top;
  other frames use the full 104px tab bar.
- This is the tab bar's own open/closed state, not a separate component. If the tab bar component
  supports a collapsed variant when its menu is open, use that variant switch rather than swapping
  components.

---

## 2. Poll dashboard (sequential states, not stacked sections)

Frame `poll-status-and-reveal`, 16:1385.

The three blocks in this frame — labeled inline as "1. Status: Waiting for Votes," "2. Live Tally
Graph," "3. Winner Revealed" — are **sequential states of one dashboard**, shown stacked here only for
documentation. Only one state renders at a time in the live product.

**State 1 — waiting** (16:1403)
- Shows vote count so far ("2 / 3 Voted") and per-person status (checkmark if voted, "waiting..." if
  not).
- Default state while `poll.status === 'open'` and not everyone has voted.

**State 2 — live tally** (16:1422)
- Horizontal bar chart of current vote share per option.
- Renders once at least one vote is in; updates live as votes come in, still while the poll is open.
- Note: states 1 and 2 likely coexist rather than being fully exclusive — the tally graph may always
  be visible once voting starts, with the "waiting for votes" header just updating its count. Confirm
  with Steve whether these are two screens or one screen with a live-updating header + graph.

**State 3 — winner revealed** (16:1441)
- Shows once the poll closes (`poll.status === 'closed'`), either because everyone voted or the timer
  expired.
- Includes an "Add to Trip" action to push the winning option into the itinerary.
- The 🎉 celebration icon exists in the layer tree but is marked hidden — likely means it animates in
  rather than being static.

---

## 3. Receipt capture and itemize (loading states, not separate screens)

One screen, three states, in this order.

**State 1 — empty / entry point** (16:1793, and the "Scan receipt" button visible in 16:1622)
- Camera capture UI; the `Rectangle` instance is a live camera-preview placeholder.

**State 2 — skeleton loading** (16:1622, `itemized-section` marked hidden, no receipt image yet)
- Shown briefly after a receipt photo is captured, while OCR/parsing runs.
- No item rows should render yet — this state exists specifically to cover that gap.

**State 3 — populated** (16:1455)
- Full itemized list with per-item assignment.
- Includes a low-confidence OCR warning on one line item ("Vinho Verde White Wine," 16:1575), where
  two of the three participant avatars are disabled from assignment.
- The disabled avatars are a *per-item rule*, not a static disabled style. Here, Ren and Nic didn't
  drink the wine, so they're excluded from that line's split. Build assignment as a per-item
  participant list, not a globally fixed set of assignable people.

---

## 6. Multi-user viewer context

Several screens carry a hidden `role-badge` layer reading "Ren's POV" (visible on frame 16:1871,
hidden on 16:1455 / 16:1622 / 16:1793).

This means the app needs to render from the perspective of whichever participant is currently logged
in, not just Ari's. Concretely:

- The receipt itemize screens (`receipt-capture-itemize`) can be viewed by any participant; the
  role-badge shows who's currently viewing.
- The "Your Share" breakdown screen (`ren-your-share`, 16:1871) is explicitly Ren's view of what they
  owe Ari; this exact screen would render different numbers if Nic were the logged-in user.
- Build a `currentUser` context/state that determines whose avatar is "me" in avatar groups, whose
  share is shown on the breakdown screen, and whether the role-badge renders at all (only show it if
  there's ambiguity worth clarifying; otherwise it can likely stay hidden in the real product and
  exists here just to flag the concept during design review).

**Open question for Steve to confirm before build:** does the prototype need actual multi-user
switching (a way to toggle "view as Ren" for demo purposes), or is Ren's POV screen just a one-off
mockup to illustrate the concept, with the real app defaulting to a single logged-in user's context
from auth? This changes scope meaningfully — worth deciding before Claude Code starts.

---

## 7. Annotation overlay (section 29:854, "Wireframe") — matched by position, not by data

**This section is a different part of the Figma file than sections 1–3 and 6 above.** Those are
sourced from node **16:501** ("Rev 3"). This section is sourced from node **29:854** ("Wireframe"),
which has its own `Annotation overlay` frame (29:2348) floating on top of the screens rather than
living inside them.

**Why this section exists, and why it's shaky.** The Figma API returns each annotation note and each
connector line as its own positioned object — it does not return which frame or layer a connector is
*attached to*. So when this file (or the Figma MCP tool) reads the section, it can see an annotation's
literal x/y coordinates and a nearby screen frame's x/y coordinates, but not the semantic link between
them. The table below was built by inferring that link from proximity and connector direction — it is
a best guess, not extracted fact. If an annotation looks like it's floating over the wrong screen, or
an arrow seems to point at empty space, or a note that should clearly apply to a modal instead reads as
attached to the frame behind it — that's this same limitation, not a new bug. Re-check against the live
Figma file (node 29:2348) before trusting a Medium/Low row.

**How to use this table:** treat the Confidence column as a checklist priority, not ground truth.
- **High** — position + content both point to one obvious target; safe to build against directly.
- **Medium** — plausible match, but verify direction/attachment in Figma before encoding it as behavior.
- **Low, verify** — do not build against this row until confirmed; note it as an open question instead.

### Home screen

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| Slide in from right | 29:2371 | Home screen, entry transition | Medium |
| Slide out toward right | 29:2376 | Home screen, exit transition | Medium |
| Show avatars for active trip members | 29:2374 | Home, active-card avatar-group (29:886) | High |
| Not final visual, replace with map outline graphic | 29:2375 | Home, image-placeholder "Lisbon Map Outline" (29:875 / 29:878) | High |

### Home to TripHub transition

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| Liquid glass expanding animation | 29:2377 | Transition when tapping the active trip card on Home, into TripHub | Medium |

### TripHub (itinerary states)

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| "Paid" badge denotes that all delegated costs in Settle Up have been reimbursed | 29:2372 | PAID badge component, used across itinerary event cards (e.g. 29:956) | High |
| Time only shows for reservations or time-sensitive events | 29:2373 | Event time field on itinerary cards (e.g. "19:00", "11:30") | High |
| Menu animates away, modal animates in from bottom of screen | 29:2378 | TripHub with Menu open (frame at x=1240) transitioning to Add Member Sheet | Medium |
| Liquid glass animation takes over tab bar with action menu | 29:2382 | TripHub tab bar opening into the Menu - iPhone action overlay | Medium |
| Slide in from right | 29:2383 | Transition into TripHub state with Menu overlay open (frame at x=3520) | Medium |
| Slide out toward right | 29:2388 | Transition out of that TripHub Menu state, into Create Poll | Medium |

### Add Member Sheet

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| Suggested results animate in, capped at 3 most relevant results to not overwhelm the UI | 29:2379 | Add Member Sheet, suggested-results section (29:1482, 29:1613) | Medium |
| Profile bubble animates in above next to existing participants | 29:2380 | Add Member Sheet, participant avatar row (Frame 4, 29:1478) | Medium |
| Full section shown for wireframe, this would be positioned higher due to keyboard, overlapping longer list of existing participants | 29:2389 | Add Member Sheet, participant list layout note for keyboard-open state | Medium |
| Animates down to reveal current trip | 29:2381 | Transition between the two Add Member Sheet states as a participant gets added | Low, verify |

### Create Poll

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| Clear, starts a new form | 29:2387 | Create Poll, "Clear" text button in nav-header (29:1641) | High |
| AI Suggest, pulls restaurant data from previous trips to suggest restaurants you and frequent travelers may like | 29:2384 | Create Poll, "AI Suggest" button (29:1675 / 29:1678) | Medium |
| Pick from map, show a map view to multi-select restaurants near you | 29:2385 | Create Poll, "Pick from map" button (29:1679 / 29:1682) | Medium |
| "Participant view" (bracket label) | 29:2366 | Grouping label spanning Create Poll and Ren Poll Notification, marking these as the non-creator participant's view | High |

### Poll dashboard

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| Changes to confirmation state 'added to trip', adds itinerary item to Lisbon 2026 trip | 29:2386 | Poll Status and Reveal, "Add to Trip" button in state-c (29:1804 / 29:1805) | High |
| Slide out toward left | 29:2390 | Transition out of Poll Status and Reveal screen | Medium |

### Receipt capture and itemize

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| Slide out toward right | 29:2393 | Transition out of TripHub (Ramiro pending dinner, frame at x=5800), into receipt flow | Medium |
| Slide in from right | 29:2395 | Transition into receipt capture flow, paired with the above | Medium |
| Slide out toward right | 29:2392 | Transition out of the receipt scrollable-form screen (x=6370) | Medium |
| Slide in from right | 29:2394 | Transition into the receipt camera/populated screen | Medium |
| Skeleton state while loading before showing uploaded line items pulled from receipt image | 29:2391 | Receipt capture loading state, between camera capture and populated items screen | High |

### Settle Up flow

| Annotation | Node | Target | Confidence |
|---|---|---|---|
| "Participant view" (bracket label) | 29:2370 | Grouping label spanning Settle Up (Ari), Ren's Your Share, and Settle Up Confirmation, marking these as the non-payer participant's view | High |

**Cross-check against section 1–3/6 above:** several of these annotations reinforce state logic
already captured from node 16:501 rather than introducing new behavior — e.g. the PAID badge note
(29:2372) matches the `status` field described in §1's pending-item driver, and the receipt skeleton
note (29:2391) matches §3's State 2 exactly. Where they overlap, that's corroboration; where a 29:854
annotation implies something §1–3/6 doesn't mention (e.g. the transition directions, the "AI Suggest"
and "Pick from map" buttons, the 3-result cap on Add Member suggestions), treat it as new information
to fold into the real build, not a conflict to resolve.

**Recommended next step:** open the Figma file to node 29:2348 and do a quick visual pass on the
Medium and Low confidence rows above — those depend on connector-line direction that this table
inferred from layout position rather than confirmed directly. Once confirmed, either correct this
table in place or move those specific notes into their target frames as real text layers, so future
reads (including future MCP reads) don't have to re-guess the same attachments.
