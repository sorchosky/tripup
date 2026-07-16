# docs/decisions.md — Decision Log

Dated record of decisions that are settled, so they don't get re-litigated. Newest at top. Keep
entries short: the decision, and why. Open questions live in `DESIGN.md` and the gap tracker in
`docs/brief.md`, not here.

---

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
- Design token values — see `DESIGN.md`.
- Which 2 screens become the hi-fi pair (lean: poll voting + settle up).
- Final mock-data values (restaurant names, amounts, 4th participant?) — see `CONTENT.md`.
