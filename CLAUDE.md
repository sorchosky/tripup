# CLAUDE.md — TripUp

Operational guide for Claude Code working in this repo. Read this first, then the doc it points you
to for whatever you're touching. It is deliberately a set of **constraints**, not a tutorial: the job
of these files is to make the design intent legible enough that generated output stays coherent
across screens nobody hand-checks one by one.

---

## What TripUp is

TripUp is a group-travel coordination app for friend groups — the app that takes on the responsible
parts of a trip (deciding, tracking, settling) so the group gets to just be *on* the trip. The
reference scenario throughout is a group heading to Lisbon (Ari, Ren, Nic) splitting dinners and
wine. Built as a take-home for a Bending Spoons design role.

Slogan: **"Decide fast, stay in the moment."**

## Current status — read before assuming things exist

This repo is a **skeleton**. The framework (these docs + a running Vite shell) is in place; the
actual screens are **not built yet**. High-fidelity screens and finalized design tokens land later
and get imported against the structure defined here. Until then:

- Design tokens in `DESIGN.md` and `src/styles/tokens.css` are **placeholders** (neutral grayscale,
  marked `TBD`). Do not treat them as the real brand palette.
- `src/screens/*` are labeled stubs, one per screen in the flow. No real UI yet.
- Mock-data values (restaurant names, amounts) are partly `TBD` in `CONTENT.md`.
- The debt-consolidation function (`src/lib/settle.ts`) is a signed stub, not implemented.

When something is a placeholder, keep it visibly a placeholder. **Do not invent** token values, copy,
amounts, or brief language to make a file look finished. If a real value is needed and unknown, ask.

## The documents (where each concern lives)

| File | Owns |
| --- | --- |
| `CLAUDE.md` (this file) | How to work here; the rules that bind the others together |
| `DESIGN.md` | Design spec: reference device, token layer, screen inventory, standout feature, debt logic |
| `BRAND.md` | Voice & tone (locked). All user-facing copy is written from here |
| `CONTENT.md` | Canonical mock data (names, restaurants, amounts) — one source so copy and code agree |
| `docs/brief.md` | Evaluator-facing QA & scoring rubric. The acceptance gate for every iteration |
| `docs/decisions.md` | Dated log of decisions already made |

Upstream source of truth for the design/brand narrative is the user's Notion project space; these
files are the machine-readable mirror that travels with the code. Notion links are in each file's
header.

## Tech stack & commands

- **React + Vite + TypeScript.** iPhone 14 target, **390×844, no scaling** (locked device frame).
- **CSS custom properties** for the token layer (`src/styles/tokens.css`); CSS Modules per component.
- **React Router** for the screen flow. **React Context + `useReducer`** for shared trip state.
- Deploy target: **Vercel** (not configured yet — deferred).

```bash
npm install        # install deps
npm run dev        # local dev server
npm run build      # production build (must pass before commit)
npm run typecheck  # tsc --noEmit (must pass before commit)
```

## Repo map

```
CLAUDE.md DESIGN.md BRAND.md CONTENT.md
docs/            brief.md (QA rubric), decisions.md
src/
  main.tsx App.tsx          # router + locked 390x844 device frame
  styles/tokens.css         # design tokens as CSS variables (placeholder values)
  screens/                  # one stub per flow screen
  components/               # shared component set (README describes intended set)
  lib/settle.ts             # minimum-transfer debt consolidation (stub)
  data/mock.ts              # typed mock data, wired to CONTENT.md
```

## Contracts (the rules that must hold)

### Design-system contract → see `DESIGN.md`
- Consume **tokens**, never hardcode raw hex/px/radius values in components. A new visual value means
  a new or updated token in `tokens.css` + `DESIGN.md`, not an inline literal.
- Semantic color roles carry meaning: `settled/success` vs `owed/warning` vs `primary` vs neutral
  surfaces. Use the role, not the color.
- The same token does the same job on every screen. Consistency across screens is graded (see rubric).

### Voice contract → see `BRAND.md`
- All user-facing copy is written **from `BRAND.md`**. Short sentences, dry wit, state the fact then
  earn the joke. No emojis, no exclamation points, no guilt-tripping about money.
- **No lorem ipsum. English only.** Every string ships as real, intentional copy.
- Use the real names/amounts from `CONTENT.md`, not ad-hoc placeholders.

### Device contract
- Everything renders inside the locked **390×844** frame. No responsive breakpoints, no scaling.
  On desktop the frame is centered; the app itself behaves as if on the device.

### Scope contract (this phase)
- Receipt-scan is **mocked** (canned scan result populates the form; no OCR pipeline).
- Debt consolidation is **real logic** when implemented — a minimum-transfer function over the
  participants — even though the demo data is small. It's a deliberate proof of engineering judgment.

## Screen flow (canonical build order)

The full journey, ≤10 screens. Build and reason about screens in this order; details for each live in
`DESIGN.md`:

1. Home / trip list
2. Trip detail / group view
3. Add participant (sheet/modal state)
4. Create poll
5. Poll voting (live vote counts)
6. Poll closed → itinerary updated
7. Log expense (+ receipt-scan state)
8. Expense exclusions / balances
9. Debt consolidation / settle up
10. Settlement confirmation

Graded state changes to preserve through the flow: live vote counts updating, poll close writing into
the itinerary, expense exclusion (some participants left off the wine), balance recalculation,
minimum-transfer debt consolidation, settle-up confirmation.

## Importing screens later (the fill-in-the-blanks workflow)

When a hi-fi screen is ready to bring into code:
1. Finalize its tokens in `DESIGN.md` + `src/styles/tokens.css` first (replace the relevant `TBD`s).
2. Build it as the matching `src/screens/*` component, consuming tokens and `src/data/mock.ts` — no
   inline literals, no fresh mock values.
3. Write its copy from `BRAND.md`; pull names/amounts from `CONTENT.md`.
4. Wire its state through the shared reducer so the graded transitions actually fire.
5. Run the QA pass below before calling it done.

## QA / self-review loop

`docs/brief.md` is the acceptance rubric, written from the evaluator's seat. **Before treating any
iteration as done**, run it: score each criterion, log gaps in its gap-tracker, and report drift
from the goal rather than quietly moving on. It exists so iterations converge on the brief instead of
wandering. (This doc is authored so it can later back a `/qa` slash-command or a review subagent that
reads it — not built yet, but that's the intended hook.)
