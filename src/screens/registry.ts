/**
 * registry.ts — the canonical screen flow.
 *
 * Single source for the ≤10-screen journey (see CLAUDE.md "Screen flow" and DESIGN.md "Screens"), plus
 * the Activity feed (#11) — a deliberate, flagged exception to that budget per issue #57. Build order
 * and routing both derive from this list, so the flow stays in one place.
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
  { id: '2', path: '/trip', title: 'Trip detail / Group view', designRef: 'DESIGN.md §Screens 2', note: 'Members, itinerary, money; the contextual next-step CTA lives here.' },
  { id: '3', path: '/trip/add', title: 'Add participant', designRef: 'DESIGN.md §Screens 3', note: 'Bring Ren into the trip (bottom sheet); 2 avatars → 3.' },
  { id: '4', path: '/poll/new', title: 'Create poll', designRef: 'DESIGN.md §Screens 4', note: 'Propose a decision (where to eat).' },
  // Confirmation beat added per issue #55 — sits between send (4) and live voting (5) so the send
  // doesn't drop straight into the auto-filling vote counts. A sub-step of "send the poll," not a new
  // numbered stop in the ≤10-screen budget (same treatment as the add-participant sheet under 3).
  { id: '4b', path: '/poll/sent', title: 'Poll sent confirmation', designRef: 'DESIGN.md §Screens 4', note: '"Poll’s out." — routes to Activity (primary) or live voting (secondary).' },
  { id: '5', path: '/poll', title: 'Poll voting (live)', designRef: 'DESIGN.md §Screens 5', note: 'Group votes; counts update live.' },
  { id: '6', path: '/poll/closed', title: 'Poll closed → itinerary', designRef: 'DESIGN.md §Screens 6', note: 'HI-FI. Result resolves and writes into the itinerary.' },
  // Screens 7 + 8 are fused into one "Scan & assign" step, matching the hi-fi mock.
  { id: '7-8', path: '/split', title: 'Scan & assign (log expense + exclusions)', designRef: 'DESIGN.md §Screens 7–8', note: 'HI-FI. Receipt + itemized split; per-item exclusion; live subtotals.' },
  { id: '9', path: '/settle', title: 'Debt consolidation / Settle up', designRef: 'DESIGN.md §Screens 9', note: 'Minimum-transfer settlement (real logic).' },
  { id: '10', path: '/settle/done', title: 'Settlement confirmation', designRef: 'DESIGN.md §Screens 10', note: 'Settled — everyone’s even.' },
  // Cross-cutting hub screen, added per issue #57 — deliberately beyond the ≤10-screen budget above
  // (destination for #55; surfaces the active poll and settle-up state from anywhere via the tab bar).
  { id: '11', path: '/activity', title: 'Activity feed', designRef: 'DESIGN.md §Screens 11', note: 'Computed digest of the live poll + settle-up state; the Activity tab’s real destination.' },
];
