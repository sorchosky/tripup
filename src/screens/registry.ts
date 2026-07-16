/**
 * registry.ts — the canonical screen flow.
 *
 * Single source for the ≤10-screen journey (see CLAUDE.md "Screen flow" and DESIGN.md "Screens").
 * Build order and routing both derive from this list, so the flow stays in one place.
 */

export interface ScreenDef {
  /** Stable id, matches the DESIGN.md screen number. */
  id: string;
  /** Route path. */
  path: string;
  /** Human title. */
  title: string;
  /** DESIGN.md section this screen maps to. */
  designRef: string;
  /** One-line note on what this screen is for (from the flow). */
  note: string;
}

export const SCREENS: ScreenDef[] = [
  { id: '1', path: '/', title: 'Home / Trip list', designRef: 'DESIGN.md §Screens 1', note: 'Entry point — the user’s trips.' },
  { id: '2', path: '/trip', title: 'Trip detail / Group view', designRef: 'DESIGN.md §Screens 2', note: 'Members, itinerary, money at a glance.' },
  { id: '3', path: '/trip/add', title: 'Add participant', designRef: 'DESIGN.md §Screens 3', note: 'Bring Ren into the trip (sheet/modal state).' },
  { id: '4', path: '/poll/new', title: 'Create poll', designRef: 'DESIGN.md §Screens 4', note: 'Propose a decision (where to eat).' },
  { id: '5', path: '/poll', title: 'Poll voting (live)', designRef: 'DESIGN.md §Screens 5', note: 'Group votes; counts update live.' },
  { id: '6', path: '/poll/closed', title: 'Poll closed → itinerary', designRef: 'DESIGN.md §Screens 6', note: 'Result resolves and writes into the itinerary.' },
  { id: '7', path: '/expense/new', title: 'Log expense', designRef: 'DESIGN.md §Screens 7', note: 'Record a shared cost; receipt-scan (mocked) state.' },
  { id: '8', path: '/balances', title: 'Exclusions / Balances', designRef: 'DESIGN.md §Screens 8', note: 'Split with exclusions (Ren + Nic off the wine); balances update.' },
  { id: '9', path: '/settle', title: 'Debt consolidation / Settle up', designRef: 'DESIGN.md §Screens 9', note: 'Minimum-transfer settlement.' },
  { id: '10', path: '/settle/done', title: 'Settlement confirmation', designRef: 'DESIGN.md §Screens 10', note: 'Settled — everyone’s even.' },
];
