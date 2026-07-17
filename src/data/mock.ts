/**
 * mock.ts — typed mock data for the demo.
 *
 * Mirrors CONTENT.md, which is the human-readable source of truth. Keep the two in sync: add demo
 * values to CONTENT.md first, then reflect them here. Values not yet locked are left as TODO — do not
 * invent amounts or names to fill them.
 */

export interface Participant {
  id: string;
  name: string;
  role: 'organizer' | 'participant';
}

// Reference group from the scenario (CONTENT.md → Participants). Ari organizes; Ren + Nic participate.
export const PARTICIPANTS: Participant[] = [
  { id: 'ari', name: 'Ari', role: 'organizer' },
  { id: 'ren', name: 'Ren', role: 'participant' },
  { id: 'nic', name: 'Nic', role: 'participant' },
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

export const TRIP = {
  id: 'lisbon-2026',
  destination: 'Lisbon',
  name: 'Lisbon 2026', // per the poll confirmation "Added to Lisbon 2026" (CONTENT.md → The trip)
  dates: null as string | null, // Trip dates remain TBD in CONTENT.md — not invented here.
};

/**
 * A single line on the scanned receipt (CONTENT.md → Expenses). Amounts are in minor units (euro
 * cents) so all splitting stays in exact integers — see src/lib/settle.ts.
 */
export interface ReceiptItem {
  id: string;
  qty: number;
  label: string;
  amountCents: number;
  /** Participant ids this line is split across. The wine defaults to Ari only (Ren + Nic excluded). */
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
    { id: 'vinho', qty: 2, label: 'Vinho Verde (bottle)', amountCents: 3200, defaultSharedBy: ['ari'], needsReview: true },
    { id: 'nata', qty: 3, label: 'Pastéis de nata', amountCents: 600, defaultSharedBy: ['ari', 'ren', 'nic'] },
  ] as ReceiptItem[],
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

/**
 * Itinerary timeline shown on the trip hub (screen 2). Seeded from CONTENT.md's real Lisbon places
 * (lodging + landmarks); the dinner slot is intentionally absent at first and gets written in when the
 * poll closes (screen 6 → itinerary), then flips paid → after settle-up. `time` is only set for
 * time-sensitive events (wireframe annotation 29:2373); day labels stay relative since trip dates are
 * still TBD in CONTENT.md.
 */
export type ItineraryStatus = 'planned' | 'pending' | 'paid';

export interface ItineraryItem {
  id: string;
  day: string;
  time: string | null;
  title: string;
  subtitle: string;
  status: ItineraryStatus;
}

export const INITIAL_ITINERARY: ItineraryItem[] = [
  { id: 'checkin', day: 'Today', time: '15:00', title: 'Check in — Dear Lisbon', subtitle: 'Gallery House · São Bento', status: 'paid' },
  { id: 'belem', day: 'Today', time: null, title: 'Belém Tower & Pastéis de Belém', subtitle: 'Riverfront walk · pastel de nata stop', status: 'planned' },
];

/** The itinerary card the poll winner writes in (screen 6). Kept here so the copy/venue stay canonical. */
export const DINNER_ITINERARY_ITEM: ItineraryItem = {
  id: 'dinner',
  day: 'Today',
  time: '21:00',
  title: 'Dinner — Cervejaria Ramiro',
  subtitle: DINNER_POLL.winnerMeta,
  status: 'pending',
};

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
