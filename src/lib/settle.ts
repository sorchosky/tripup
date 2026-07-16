/**
 * settle.ts — debt consolidation (minimum-transfer simplification).
 *
 * STUB — not implemented yet. When screen 9 is built, implement a real minimum-transfer algorithm:
 * given each participant's net balance, produce the fewest transfers that settle everyone. This is a
 * deliberate proof of engineering judgment (see DESIGN.md → "Debt consolidation logic" and
 * docs/brief.md rubric C7), so it must be real logic, not a visual mock.
 */

export interface Balance {
  /** Participant id. */
  personId: string;
  /** Net amount, in the trip currency's minor units. Positive = owed to them, negative = they owe. */
  net: number;
}

export interface Transfer {
  fromId: string;
  toId: string;
  amount: number;
}

/**
 * Consolidate net balances into the minimum set of transfers that settles everyone.
 *
 * TODO: implement (greedy max-creditor/max-debtor matching is sufficient for 3–4 people).
 * Returns [] for now so the shell type-checks and builds; wire this up with screen 9.
 */
export function settle(balances: Balance[]): Transfer[] {
  void balances;
  return [];
}
