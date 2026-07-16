# CONTENT.md — Canonical Mock Data

One source of truth for the demo data used across every screen and in code, so copy (`BRAND.md` voice)
and implementation (`src/data/mock.ts`) never disagree. Real content only — **no lorem ipsum**, English
only. Values marked **`TBD`** are locked before the screens that need them are built; don't invent
amounts or names ad hoc elsewhere — add them here first.

> Feeds: `src/data/mock.ts` (typed export). Referenced by `DESIGN.md` (mock data plan).

---

## The trip

- **Destination:** Lisbon
- **Trip name:** `TBD`
- **Dates:** `TBD`

## Participants

The reference group from the scenario. Ari is the Organizer; Ren and Nic are Participants.

| Name | Role | Notes |
| --- | --- | --- |
| Ari | Organizer | Sets up the trip, the "you"/primary user in most flows |
| Ren | Participant | Shows up hangry (poll-notification reference); excluded from the wine split |
| Nic | Participant | Excluded from the wine split |
| `TBD` | Participant | Add if a 4th participant is needed to make debt consolidation non-trivial |

> Debt consolidation reads best with 3–4 people. Decide whether a 4th name is added before building
> screen 9.

## Expenses

Consistent expense set used across log / balances / settle-up. Amounts `TBD` until locked — but once
set, these exact numbers are used everywhere (copy and code).

| Item | Payer | Amount | Split | Excluded |
| --- | --- | --- | --- | --- |
| Dinner | `TBD` | `TBD` | Even across all | — |
| Wine | `TBD` (Ari + one other) | `TBD` | Split among drinkers only | **Ren, Nic** |
| `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |

Notes:
- The **wine exclusion** (Ren + Nic left off) is a graded moment — it's how the exclusion logic is
  shown. Keep it in the data.
- Restaurant/venue names: `TBD` — use real, specific names (e.g. a named trattoria), not "Restaurant A".

## Poll

The "where to eat" decision used on screens 4–6.

- **Question:** `TBD` (e.g. "Where are we eating tonight?")
- **Options:** `TBD` — 3 named spots. The reference copy ("Trattoria wins, 4 to 2") implies a
  trattoria among them; lock the actual names.
- **Result:** `TBD` — winning option + vote tally (reference copy uses 4 to 2).

## Receipt scan (mock)

Canned scan result that populates the Log-expense form — no OCR. Values `TBD`, but should match a real
expense above so the demo stays internally consistent (e.g. the dinner receipt).

- **Merchant:** `TBD`
- **Total:** `TBD`
- **Suggested split:** `TBD`

## Settlement

Derived from the expenses above via `src/lib/settle.ts` (minimum-transfer). Not hand-authored — but the
reference copy ("Two transfers close it out") implies the final settlement resolves to ~2 transfers.
Once expense amounts are locked, confirm the algorithm's output matches that narrative and update the
copy if it doesn't.
