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
- **Options:**

| Name | Vibe | Cuisine | Neighborhood | Address | Coordinates | Rating | Price | Phone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A Nossa Casa | Intimate, homey | Portuguese-Nepali fusion, small plates | Bairro Alto | R. da Atalaia 31, 1200-037 Lisboa, Portugal | 38.7118452, -9.1449444 | 4.8 | $$ | +351 21 342 0484 |
| Taberna Sal Grosso | Casual, lively tavern | Portuguese tapas | Santa Apolónia | Calçada do Forte 22, 1100-256 Lisboa, Portugal | 38.7136987, -9.1244447 | 4.7 | $ | +351 910 137 713 |
| Black Pavilion Restaurant | Upscale, romantic rooftop view | Contemporary Portuguese | Torel Palace | R. Câmara Pestana 45, 1150-082 Lisboa, Portugal | 38.7184707, -9.140129 | 4.7 | $$$ | +351 21 809 9132 |

  Note: the existing reference copy ("Trattoria wins, 4 to 2") assumed an Italian trattoria; none of
  these 3 real options literally is one — whoever locks Question/Result wording should loosen
  "trattoria" or revisit that reference line.
- **Result:** `TBD` — winning option + vote tally (reference copy uses 4 to 2).

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
