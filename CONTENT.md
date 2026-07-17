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
- **Dates:** `TBD`

## Participants

The reference group from the scenario. Ari is the Organizer; Ren and Nic are Participants. Confirmed
by the hi-fi mocks — no 4th participant appears (avatar rows are consistently A / R / N).

| Name | Role | Notes |
| --- | --- | --- |
| Ari | Organizer | Sets up the trip, the "you"/primary user in most flows |
| Ren | Participant | Shows up hangry (poll-notification reference); excluded from the wine split |
| Nic | Participant | Excluded from the wine split |

> Debt consolidation reads fine with 3 people given the confirmed expense set below (~2 transfers to
> settle). No 4th participant needed — the hi-fi mocks settle this.

## Expenses

Consistent expense set used across log / balances / settle-up. Sourced from the receipt on the
`receipt-capture-itemize` hi-fi mock — dinner at Cervejaria Ramiro, Lisbon, Jun 17, 21:44.

| Item | Qty | Amount | Assigned to | Excluded |
| --- | --- | --- | --- | --- |
| Couvert (bread & olives) | ×3 | €7.50 | Ari, Ren, Nic | — |
| Arroz de marisco | ×2 | €44.00 | Ari, Ren, Nic | — |
| Gambas à guilho | ×1 | €18.50 | Ari, Ren, Nic | — |
| Vinho Verde (bottle) | ×2 | €32.00 | Ari only | **Ren, Nic** |
| Pastéis de nata | ×3 | €6.00 | Ari, Ren, Nic | — |

- **Total:** €108.00 · 5 items.
- **Per-person subtotal (as shown on the footer):** Ari €57.34 · Ren €25.33 · Nic €25.33.
- One line (Vinho Verde) carries an OCR "needs a second look" warning in the mock — keep that
  affordance tied to a real line, not a decorative one-off.
- Restaurant/venue name: **Cervejaria Ramiro** (also the poll winner — same venue across the demo,
  which is what makes the flow read as one coherent trip rather than disconnected screens).

Notes:
- The **wine exclusion** (Ren + Nic left off) is a graded moment — it's how the exclusion logic is
  shown. Confirmed in the hi-fi mock via the outlined (unassigned) avatar chips on the Vinho Verde row.

## Poll

The "where to eat" decision used on screens 4–6. Sourced from the `poll-status-and-reveal` hi-fi mock.

- **Question:** "Where should we eat tonight?"
- **Options / result:** Cervejaria Ramiro (winner, 2 votes) · Time Out Market (1 vote) · A Cevicheria
  (0 votes). `RESULTS · 3/3 VOTED`, poll closed at 6:32 PM.
- **Winner card meta:** Seafood · 4 min walk · €€.

## Receipt scan (mock)

Canned scan result that populates the Log-expense form — no OCR. Matches the Cervejaria Ramiro dinner
expense above, so the demo stays internally consistent.

- **Merchant:** Cervejaria Ramiro
- **Total:** €108.00 (5 items)
- **Suggested split:** even across items as itemized above, with Vinho Verde excluding Ren and Nic

## Settlement

Derived from the expenses above via `src/lib/settle.ts` (minimum-transfer). Not hand-authored — but the
reference copy ("Two transfers close it out") implies the final settlement resolves to ~2 transfers.
Once expense amounts are locked, confirm the algorithm's output matches that narrative and update the
copy if it doesn't.
