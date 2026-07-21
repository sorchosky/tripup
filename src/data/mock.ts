/**
 * mock.ts — typed mock data for the demo.
 *
 * Mirrors CONTENT.md, which is the human-readable source of truth. Keep the two in sync: add demo
 * values to CONTENT.md first, then reflect them here. Values not yet locked are left as TODO — do not
 * invent amounts or names to fill them.
 */

import type { ComponentType } from 'react';
import ariAvatar from '../assets/avatar-ari.svg';
import { LisbonSkyline, TokyoSkyline, ParisSkyline } from '../assets/skylines';

export interface Participant {
  id: string;
  name: string;
  role: 'organizer' | 'participant';
  /** Placeholder headshot (CONTENT.md → Participants). Omitted participants fall back to initials. */
  avatarUrl?: string;
}

// Reference group from the scenario (CONTENT.md → Participants). Ari organizes; Ren + Nic participate.
// Josie/Michael/Genevieve join the Tokyo/Paris trips (CONTENT.md → Other trips).
export const PARTICIPANTS: Participant[] = [
  { id: 'ari', name: 'Ari', role: 'organizer', avatarUrl: ariAvatar },
  { id: 'ren', name: 'Ren', role: 'participant' },
  { id: 'nic', name: 'Nic', role: 'participant' },
  { id: 'josie', name: 'Josie', role: 'participant' },
  { id: 'michael', name: 'Michael', role: 'participant' },
  { id: 'genevieve', name: 'Genevieve', role: 'participant' },
];

/**
 * The flow opens with Ari + Nic already on the trip; Ari brings Ren in on screen 3 (Add participant).
 * This is the wireframe's 2-avatars → 3-avatars transition (wireframe-handoff.md §1), so the "add a
 * participant" beat has something to actually do. Ren is defined above but not seeded here.
 */
export const INITIAL_PARTICIPANT_IDS = ['ari', 'nic'] as const;
export const ORGANIZER_ID = 'ari' as const;

export function participantById(id: string): Participant {
  const p = PARTICIPANTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown participant: ${id}`);
  return p;
}

export type TripStatus = 'live' | 'upcoming' | 'past';

export const TRIP = {
  id: 'lisbon-2026',
  destination: 'Lisbon',
  name: 'Lisbon 2026', // per the poll confirmation "Added to Lisbon 2026" (CONTENT.md → The trip)
  status: 'live' as TripStatus,
  dates: { start: '2026-06-10', end: '2026-06-18' }, // locked (CONTENT.md → The trip)
  spendCents: 10800, // group spend so far; matches DINNER_RECEIPT.totalCents
};

/**
 * Home's trip list (CONTENT.md → Other trips). Tokyo and Paris are summary-only — no itinerary/poll/
 * expense flow is wired for them (out of scope for #7; TripContext still tracks Lisbon as the one
 * active trip). Locked dates/spend are new mock values this ticket adds under the approved override
 * of the "no fabricated trips" stance — see docs/decisions.md.
 */
export interface TripSummary {
  id: string;
  name: string;
  destination: string;
  status: TripStatus;
  dates: { start: string; end: string };
  spendCents: number;
  participantIds: string[];
  Skyline: ComponentType;
}

export const TRIPS: TripSummary[] = [
  {
    id: TRIP.id,
    name: TRIP.name,
    destination: TRIP.destination,
    status: TRIP.status,
    dates: TRIP.dates,
    spendCents: TRIP.spendCents,
    participantIds: ['ari', 'ren', 'nic'],
    Skyline: LisbonSkyline,
  },
  {
    id: 'tokyo-2026',
    name: 'Tokyo',
    destination: 'Tokyo',
    status: 'upcoming',
    dates: { start: '2026-10-03', end: '2026-10-12' },
    spendCents: 0, // nothing logged yet — upcoming trip
    participantIds: ['ari', 'josie'],
    Skyline: TokyoSkyline,
  },
  {
    id: 'paris-2026',
    name: 'Paris weekend',
    destination: 'Paris',
    status: 'past',
    dates: { start: '2026-03-13', end: '2026-03-15' },
    spendCents: 54000, // proposed group total (CONTENT.md → Other trips) — flagged for review
    participantIds: ['ari', 'michael', 'genevieve'],
    Skyline: ParisSkyline,
  },
];

/**
 * A single line on the scanned receipt (CONTENT.md → Expenses). Amounts are in minor units (euro
 * cents) so all splitting stays in exact integers — see src/lib/settle.ts.
 */
export interface ReceiptItem {
  id: string;
  qty: number;
  label: string;
  amountCents: number;
  /** Participant ids this line is split across. Every line — including the wine — starts even across
   *  all three; exclusion (e.g. Ren + Nic off the wine) is a manual deselect via TOGGLE_ASSIGNEE, not
   *  a pre-set default (issue #97). */
  defaultSharedBy: string[];
  /** One line carries a mocked low-confidence OCR flag (the Vinho Verde), per the hi-fi mock. */
  needsReview?: boolean;
}

/**
 * The dinner at Cervejaria Ramiro — the one shared cost that drives the whole money flow. Sourced
 * from the receipt on the `receipt-capture-itemize` hi-fi mock (CONTENT.md → Expenses / Receipt scan).
 * Ari paid the tab; the split (and the wine exclusion) resolve balances and, in turn, the settle-up.
 */
export const DINNER_RECEIPT = {
  id: 'dinner-ramiro',
  merchant: 'Cervejaria Ramiro',
  locationDate: 'Lisbon · Jun 17, 21:44',
  payerId: 'ari',
  totalCents: 10800,
  items: [
    { id: 'couvert', qty: 3, label: 'Couvert (bread & olives)', amountCents: 750, defaultSharedBy: ['ari', 'ren', 'nic'] },
    { id: 'arroz', qty: 2, label: 'Arroz de marisco', amountCents: 4400, defaultSharedBy: ['ari', 'ren', 'nic'] },
    { id: 'gambas', qty: 1, label: 'Gambas à guilho', amountCents: 1850, defaultSharedBy: ['ari', 'ren', 'nic'] },
    { id: 'vinho', qty: 2, label: 'Vinho Verde (bottle)', amountCents: 3200, defaultSharedBy: ['ari', 'ren', 'nic'], needsReview: true },
    { id: 'nata', qty: 3, label: 'Pastéis de nata', amountCents: 600, defaultSharedBy: ['ari', 'ren', 'nic'] },
  ] as ReceiptItem[],
};

/**
 * Settle-up lifecycle timestamps (issue #104). Same fixed-narrative-day treatment as
 * `DINNER_POLL.closedAt`/`DINNER_RECEIPT.locationDate` (see `src/lib/dates.ts` → `NARRATIVE_TODAY`) —
 * deliberate demo constants, not `Date.now()`, so the Activity feed's timeline stays on Jun 17
 * regardless of when the demo is actually run. Requests go out shortly after the receipt is logged
 * (21:44); the payout reads back a few minutes later, once Ari's redeemed it.
 */
export const SETTLEMENT_TIMELINE = {
  requestsSentAt: '10:05 PM',
  redeemedAt: '10:12 PM',
};

export interface Expense {
  id: string;
  label: string;
  payerId: string;
  /** Minor units (euro cents). */
  amount: number;
  /** Participant ids sharing this expense (exclusions are simply omitted). */
  sharedBy: string[];
}

export interface Venue {
  id: string;
  name: string;
  neighborhood?: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  priceLevel?: number;
  phone?: string | null;
  vibe?: string;
  cuisine?: string;
  notes?: string;
}

export interface Landmark {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  phone?: string;
  notes?: string;
}

export interface Lodging {
  id: string;
  name: string;
  type: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  notes: string;
}

// Lodging, landmarks, and itinerary options (CONTENT.md → Lodging / Landmarks / Poll / Itinerary options).
export const LODGING: Lodging = {
  id: 'dear-lisbon-gallery-house',
  name: 'Dear Lisbon - Gallery House',
  type: 'boutique_hotel',
  neighborhood: 'São Bento',
  address: 'R de S. Bento 31, 1200-815 Lisboa, Portugal',
  lat: 38.710795,
  lng: -9.152734,
  rating: 4.6,
  phone: '+351 932 210 150',
  notes:
    'Central, walkable to Bairro Alto and Chiado, 15-20 min to Belém by train from Cais do Sodré/Santos. The house the group returns to in the scenario.',
};

export const LANDMARKS: Landmark[] = [
  {
    id: 'belem-tower',
    name: 'Belém Tower',
    category: 'landmark',
    address: 'Av. Brasília, 1400-038 Lisboa, Portugal',
    lat: 38.6915837,
    lng: -9.2159773,
    rating: 4.5,
    phone: '+351 21 362 0034',
    notes:
      'Iconic UNESCO monument on the Tagus riverfront, closed for restoration as of early 2026 per recent reviews, still a strong photo/itinerary stop.',
  },
  {
    id: 'pasteis-de-belem',
    name: 'Pastéis de Belém',
    category: 'bakery',
    address: 'R. de Belém 84-92, 1300-085 Lisboa, Portugal',
    lat: 38.6975105,
    lng: -9.2032276,
    rating: 4.6,
    phone: '+351 21 363 7423',
    notes:
      'The original pastel de nata bakery, dating to the 1800s, right by Belém Tower. Good filler stop between attraction and dinner.',
  },
  {
    id: 'oceanario-de-lisboa',
    name: 'Oceanário de Lisboa',
    category: 'landmark',
    address: 'Esplanada D. Carlos I, 1990-005 Lisboa, Portugal',
    lat: 38.7635435,
    lng: -9.0937415,
    rating: 4.6,
    phone: '+351 218 917 002',
    notes: 'One of Europe’s largest aquariums, in Parque das Nações. A mid-trip day activity, distinct from the Belém/dinner cluster.',
  },
];

export interface PollOption {
  id: string;
  name: string;
  votes: number;
}

// Poll result (CONTENT.md → Poll). Sourced from the poll-status-and-reveal hi-fi mock — this
// supersedes an earlier draft candidate list that didn't match the mock's actual venues/result.
export const DINNER_POLL = {
  question: 'Where should we eat tonight?',
  closedAt: '6:32 PM',
  totalVoters: 3,
  votesIn: 3,
  options: [
    { id: 'cervejaria-ramiro', name: 'Cervejaria Ramiro', votes: 2 },
    { id: 'time-out-market', name: 'Time Out Market', votes: 1 },
    { id: 'a-cevicheria', name: 'A Cevicheria', votes: 0 },
  ] as PollOption[],
  winnerId: 'cervejaria-ramiro',
  winnerMeta: 'Seafood · 4 min walk · €€',
};

/**
 * AI Suggest source for Create poll (screen 4). Per the wireframe annotation (29:2384), AI Suggest
 * "pulls restaurant data from previous trips to suggest restaurants you and frequent travelers may
 * like." In the demo it fills the empty poll form with the canonical dinner candidates, so the poll
 * that gets sent lines up with the voting screen (screen 5) that follows. Names stay in sync with
 * DINNER_POLL rather than being a second, divergent list.
 */
export const AI_SUGGESTED_SPOTS: string[] = DINNER_POLL.options.map((o) => o.name);

export const LUNCH_OPTIONS: Venue[] = [
  {
    id: 'tapa-do-bairroalto',
    name: 'Tapa do BairroAlto',
    vibe: 'energetic, hidden gem',
    cuisine: 'Portuguese tapas',
    address: 'R. da Barroca 129A, 1200-049 Lisboa, Portugal',
    lat: 38.7126383,
    lng: -9.1446924,
    rating: 4.9,
    phone: '+351 963 012 182',
  },
  {
    id: 'lisbon-tu-e-eu',
    name: 'Lisbon Tu e Eu',
    vibe: 'cozy, no-frills soul food',
    cuisine: 'Traditional Portuguese',
    address: 'R da Adiça 58, 1100-116 Lisboa, Portugal',
    lat: 38.7109511,
    lng: -9.1300522,
    rating: 4.5,
    priceLevel: 1,
    phone: null,
    notes: 'Cash only per reviews, worth flagging if used in an expense-tracking scenario.',
  },
];

export const COFFEE_OPTIONS: Venue[] = [
  {
    id: 'the-coffee',
    name: 'The Coffee',
    vibe: 'minimalist, specialty',
    address: 'Calçada do Duque 47, 1200-016 Lisboa, Portugal',
    lat: 38.7131868,
    lng: -9.142473,
    rating: 4.8,
    phone: '+351 41 99279-7895',
  },
  {
    id: 'put-it-on-lisbon',
    name: 'PUT IT ON LISBON',
    vibe: 'cozy, vegan and gluten-free',
    address: 'CC do Conde de Pombeiro 15C, 1150-099 Lisboa, Portugal',
    lat: 38.7235029,
    lng: -9.1370858,
    rating: 4.9,
    phone: '+351 911 845 360',
  },
];

export const BREAKFAST_OPTIONS: Venue[] = [
  {
    id: 'hygge-kaffe',
    name: 'Hygge Kaffe',
    vibe: 'build-your-own, minimalist Scandinavian',
    address: 'R. Tomás Ribeiro 95B, 1050-227 Lisboa, Portugal',
    lat: 38.7315413,
    lng: -9.1490725,
    rating: 4.8,
    priceLevel: 2,
    phone: '+351 931 329 691',
  },
  {
    id: 'breakfast-lovers-chiado',
    name: 'Breakfast Lovers Chiado',
    vibe: 'bright, extensive Eggs Benedict menu',
    address: 'R. Vítor Cordon 26, 1200-484 Lisboa, Portugal',
    lat: 38.7080494,
    lng: -9.141487,
    rating: 4.9,
    phone: '+351 939 531 673',
  },
];

/**
 * Typeahead source for Create poll's option fields (issue #93, replacing the old "AI Suggest" chip).
 * The top 3 rows of the dropdown are always `AI_SUGGESTED_SPOTS`; this list backs the rows below them
 * — a broader sample of real Lisbon venues/landmarks so the field still surfaces something useful once
 * the AI picks are exhausted or don't match what's typed. Names are pulled straight from CONTENT.md
 * (Poll, Landmarks, Itinerary options) and the venues already seeded elsewhere in this file — no
 * fictional spots invented for the dropdown. `CreatePollScreen` de-dupes against `AI_SUGGESTED_SPOTS`
 * before rendering, so a name never appears twice across the two groups.
 */
export const LISBON_POLL_SUGGESTIONS: string[] = [
  ...AI_SUGGESTED_SPOTS,
  ...LANDMARKS.map((l) => l.name),
  ...LUNCH_OPTIONS.map((v) => v.name),
  ...COFFEE_OPTIONS.map((v) => v.name),
  ...BREAKFAST_OPTIONS.map((v) => v.name),
  LODGING.name,
];

/**
 * Itinerary timeline shown on the trip hub (screen 2) — chronological, day-grouped (issue #12; see
 * CONTENT.md → Itinerary for the locked day-by-day sequence). `day` is a real ISO date inside the
 * locked trip range (2026-06-10 – 2026-06-18); `time` is only set for time-sensitive events (wireframe
 * annotation 29:2373) and null items sort last within their day. The dinner slot is intentionally
 * absent at first and gets written in when the poll closes (screen 6 → itinerary), then flips
 * pending → paid after settle-up.
 */
export type ItineraryStatus = 'planned' | 'pending' | 'paid';

/**
 * Drives the rail-node icon (issue #91): landmark/event → MapPin, entertainment → Star, breakfast →
 * Coffee, dinner → Utensils (per the issue). `coffee` and `lunch` extend that same closed icon set to
 * the two seed items the issue's four categories don't cover — `coffee` reuses the Coffee glyph (a
 * coffee stop, same as breakfast's beverage-forward icon), `lunch` reuses Utensils alongside `dinner`
 * (both are sit-down meals). See `nodeTone` in TripDetailScreen.tsx for the icon map itself.
 */
export type ItineraryCategory = 'landmark' | 'event' | 'entertainment' | 'breakfast' | 'coffee' | 'lunch' | 'dinner';

export interface ItineraryItem {
  id: string;
  day: string;
  time: string | null;
  title: string;
  category: ItineraryCategory;
  status: ItineraryStatus;
}

export const INITIAL_ITINERARY: ItineraryItem[] = [
  { id: 'checkin', day: '2026-06-10', time: '15:00', title: 'Check in — Dear Lisbon', category: 'landmark', status: 'paid' },
  { id: 'belem', day: '2026-06-11', time: null, title: 'Belém Tower & Pastéis de Belém', category: 'landmark', status: 'planned' },
  { id: 'oceanario', day: '2026-06-15', time: '11:00', title: LANDMARKS[2].name, category: 'landmark', status: 'planned' },
  { id: 'breakfast', day: '2026-06-17', time: '08:30', title: `Breakfast — ${BREAKFAST_OPTIONS[0].name}`, category: 'breakfast', status: 'planned' },
  { id: 'lunch', day: '2026-06-17', time: '13:00', title: `Lunch — ${LUNCH_OPTIONS[0].name}`, category: 'lunch', status: 'planned' },
];

/** The itinerary card the poll winner writes in (screen 6). Kept here so the copy/venue stay canonical. */
export const DINNER_ITINERARY_ITEM: ItineraryItem = {
  id: 'dinner',
  day: '2026-06-17',
  time: '21:00',
  title: 'Dinner — Cervejaria Ramiro',
  category: 'dinner',
  status: 'pending',
};

/** The Trip Hub FAB's "Add to itinerary" quick stop — sourced from CONTENT.md's locked coffee options. */
export const COFFEE_STOP_ITINERARY_ITEM: ItineraryItem = {
  id: 'coffee-stop',
  day: '2026-06-17',
  time: null,
  title: `Coffee run — ${COFFEE_OPTIONS[0].name}`,
  category: 'coffee',
  status: 'planned',
};
