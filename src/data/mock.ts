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
  // TODO: a 4th participant if debt consolidation needs to be non-trivial (see CONTENT.md).
];

export const TRIP = {
  destination: 'Lisbon',
  name: null as string | null, // TODO: lock in CONTENT.md
  dates: null as string | null, // TODO: lock in CONTENT.md
};

export interface Expense {
  id: string;
  label: string;
  payerId: string;
  /** Minor units (e.g. cents). */
  amount: number;
  /** Participant ids sharing this expense (exclusions are simply omitted). */
  sharedBy: string[];
}

// TODO: lock the expense set (amounts, venue names, the wine exclusion of Ren + Nic) in CONTENT.md,
// then populate this array. The wine expense's `sharedBy` must exclude 'ren' and 'nic'.
export const EXPENSES: Expense[] = [];

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

// TODO: add a Poll type (question, options, closesAt, result) once CONTENT.md's Poll section locks
// Question/Result copy. Screens 4-6 consume DINNER_POLL_OPTIONS directly until then.
export const DINNER_POLL_OPTIONS: Venue[] = [
  {
    id: 'a-nossa-casa',
    name: 'A Nossa Casa',
    vibe: 'intimate, homey',
    cuisine: 'Portuguese-Nepali fusion, small plates',
    neighborhood: 'Bairro Alto',
    address: 'R. da Atalaia 31, 1200-037 Lisboa, Portugal',
    lat: 38.7118452,
    lng: -9.1449444,
    rating: 4.8,
    priceLevel: 2,
    phone: '+351 21 342 0484',
  },
  {
    id: 'taberna-sal-grosso',
    name: 'Taberna Sal Grosso',
    vibe: 'casual, lively tavern',
    cuisine: 'Portuguese tapas',
    neighborhood: 'Santa Apolónia',
    address: 'Calçada do Forte 22, 1100-256 Lisboa, Portugal',
    lat: 38.7136987,
    lng: -9.1244447,
    rating: 4.7,
    priceLevel: 1,
    phone: '+351 910 137 713',
  },
  {
    id: 'black-pavilion-restaurant',
    name: 'Black Pavilion Restaurant',
    vibe: 'upscale, romantic rooftop view',
    cuisine: 'Contemporary Portuguese',
    neighborhood: 'Torel Palace',
    address: 'R. Câmara Pestana 45, 1150-082 Lisboa, Portugal',
    lat: 38.7184707,
    lng: -9.140129,
    rating: 4.7,
    priceLevel: 3,
    phone: '+351 21 809 9132',
  },
];

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
