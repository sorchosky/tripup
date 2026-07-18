/**
 * settle.ts — debt consolidation (minimum-transfer simplification).
 *
 * Two jobs, both real logic (DESIGN.md → "Debt consolidation logic", rubric C7):
 *  1. Turn a receipt + its per-item assignments into each person's net balance.
 *  2. Consolidate those balances into the fewest transfers that settle everyone.
 *
 * Everything is euro cents (integers) so splitting never drifts on floating point. When a split
 * doesn't divide evenly, the rounding remainder lands on the payer — they fronted the bill, so they
 * absorb the half-cent rather than a guest owing an odd amount. For the Ramiro dinner this reproduces
 * the hi-fi footer exactly: Ari €57.34, Ren €25.33, Nic €25.33.
 */

import type { ReceiptItem } from '../data/mock';

export interface Balance {
  /** Participant id. */
  personId: string;
  /** Net amount in euro cents. Positive = owed to them, negative = they owe. */
  net: number;
}

export interface Transfer {
  fromId: string;
  toId: string;
  /** Euro cents. */
  amount: number;
}

/** Per-item assignment: item id → the participant ids currently splitting that line. */
export type Assignment = Record<string, string[]>;

export interface Receiptish {
  payerId: string;
  totalCents: number;
  items: ReceiptItem[];
}

/**
 * Each person's share of the bill under the current assignments, in cents. Shares are summed as exact
 * fractions and rounded per person; any rounding drift (a cent or two) is folded onto the payer so the
 * shares always sum back to the receipt total.
 */
export function computeShares(receipt: Receiptish, assignment: Assignment): Record<string, number> {
  const exact: Record<string, number> = {};
  const add = (id: string, cents: number) => {
    exact[id] = (exact[id] ?? 0) + cents;
  };

  for (const item of receipt.items) {
    const people = assignment[item.id] ?? item.defaultSharedBy;
    if (people.length === 0) continue; // an unassigned line falls to the payer via drift below
    for (const id of people) add(id, item.amountCents / people.length);
  }

  const shares: Record<string, number> = {};
  let rounded = 0;
  for (const id of Object.keys(exact)) {
    shares[id] = Math.round(exact[id]);
    rounded += shares[id];
  }

  // Fold the rounding remainder (and any fully-unassigned lines) onto the payer.
  const drift = receipt.totalCents - rounded;
  if (drift !== 0) shares[receipt.payerId] = (shares[receipt.payerId] ?? 0) + drift;

  return shares;
}

/**
 * Net balance per person = what they paid − what they owe. The payer covered the whole total; everyone
 * (payer included) owes their share.
 */
export function computeBalances(
  receipt: Receiptish,
  assignment: Assignment,
  participantIds: string[],
): Balance[] {
  const shares = computeShares(receipt, assignment);
  return participantIds.map((personId) => {
    const paid = personId === receipt.payerId ? receipt.totalCents : 0;
    const owes = shares[personId] ?? 0;
    return { personId, net: paid - owes };
  });
}

/**
 * Consolidate net balances into the minimum set of transfers that settles everyone.
 *
 * Greedy max-debtor → max-creditor matching: repeatedly send the largest debtor's money to the largest
 * creditor. For n people this yields at most n−1 transfers, which is optimal for the balanced,
 * few-party case this app deals in (a full min-cash-flow is NP-hard in general; the greedy result is
 * what a person would do by hand and matches the "two transfers close it out" narrative here).
 */
export function settle(balances: Balance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ id: b.personId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ id: b.personId, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0) transfers.push({ fromId: debtors[i].id, toId: creditors[j].id, amount });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount === 0) i += 1;
    if (creditors[j].amount === 0) j += 1;
  }
  return transfers;
}
