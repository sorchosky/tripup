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
