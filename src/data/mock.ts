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
