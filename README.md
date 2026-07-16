# TripUp

Group-travel coordination app for friend groups — the app that takes on the responsible parts of a
trip (deciding, tracking, settling) so the group gets to just be on the trip. Design challenge for a
Bending Spoons application.

> **Decide fast, stay in the moment.**

## Status

Skeleton / framework. The design-intent docs and a running React + Vite shell are in place; the
screens are built later against this structure.

## Start here

| Doc | What it's for |
| --- | --- |
| [`CLAUDE.md`](./CLAUDE.md) | How to work in this repo; the rules that bind everything together |
| [`DESIGN.md`](./DESIGN.md) | Design spec — reference device, token layer, screens, debt logic |
| [`BRAND.md`](./BRAND.md) | Voice & tone (locked); all copy is written from here |
| [`CONTENT.md`](./CONTENT.md) | Canonical mock data (names, restaurants, amounts) |
| [`docs/brief.md`](./docs/brief.md) | Submission requirements + scored QA rubric (the acceptance gate) |
| [`docs/decisions.md`](./docs/decisions.md) | Log of settled decisions |

## Develop

```bash
npm install
npm run dev        # local dev server (renders inside a locked 390x844 device frame)
npm run build      # typecheck + production build
npm run typecheck  # tsc --noEmit
```

Target device: iPhone 14, 390×844, no scaling. Stack: React + Vite + TypeScript.
