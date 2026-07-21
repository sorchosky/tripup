import { describe, expect, it } from 'vitest';
import { computeBalances, computeShares, personItemShares, settle, type Assignment, type Balance } from './settle';
import { DINNER_RECEIPT } from '../data/mock';

const PARTICIPANT_IDS = ['ari', 'ren', 'nic'];

/**
 * The wine (`vinho`) excluded for Ren + Nic, everything else on `defaultSharedBy` (all three) — the
 * scenario the settle.ts header comment documents as reproducing the hi-fi footer exactly: Ari €57.34,
 * Ren €25.33, Nic €25.33.
 */
const WINE_EXCLUDED_ASSIGNMENT: Assignment = { vinho: ['ari'] };

describe('computeShares / computeBalances — DINNER_RECEIPT baseline', () => {
  it('matches the hi-fi footer (Ari €57.34, Ren €25.33, Nic €25.33) when Ren/Nic are off the wine', () => {
    const shares = computeShares(DINNER_RECEIPT, WINE_EXCLUDED_ASSIGNMENT);
    expect(shares.ari).toBe(5734);
    expect(shares.ren).toBe(2533);
    expect(shares.nic).toBe(2533);
    // Shares always sum back to the receipt total, rounding drift and all.
    expect(shares.ari + shares.ren + shares.nic).toBe(DINNER_RECEIPT.totalCents);
  });

  it('derives net balances: Ari fronted the tab, so Ari nets positive and Ren/Nic net negative', () => {
    const balances = computeBalances(DINNER_RECEIPT, WINE_EXCLUDED_ASSIGNMENT, PARTICIPANT_IDS);
    const byId = Object.fromEntries(balances.map((b) => [b.personId, b.net]));
    expect(byId.ari).toBe(5066); // paid 10800, owes 5734
    expect(byId.ren).toBe(-2533);
    expect(byId.nic).toBe(-2533);
    // Balances always net to zero — nobody's money vanishes.
    expect(balances.reduce((sum, b) => sum + b.net, 0)).toBe(0);
  });

  it('splits evenly three ways when the wine is left on defaultSharedBy (no exclusion)', () => {
    // With every item split ari/ren/nic and the receipt total (10800) an exact multiple of 3, each
    // person's exact share is a whole number (3600) — no rounding drift lands on the payer here.
    const shares = computeShares(DINNER_RECEIPT, {});
    expect(shares).toEqual({ ari: 3600, ren: 3600, nic: 3600 });
  });
});

describe('wine (vinho) exclusion — isolation', () => {
  it('changes only the wine-derived line of each person\'s breakdown, not the other items', () => {
    const nonWineItemIds = DINNER_RECEIPT.items.filter((i) => i.id !== 'vinho').map((i) => i.id);

    for (const personId of PARTICIPANT_IDS) {
      const withWine = personItemShares(DINNER_RECEIPT, {}, personId);
      const wineExcluded = personItemShares(DINNER_RECEIPT, WINE_EXCLUDED_ASSIGNMENT, personId);

      const nonWineOf = (shares: ReturnType<typeof personItemShares>) =>
        shares.filter((s) => nonWineItemIds.includes(s.id)).map((s) => ({ id: s.id, amountCents: s.amountCents }));

      // The couvert/arroz/gambas/nata lines are identical whether or not the wine is excluded.
      expect(nonWineOf(wineExcluded)).toEqual(nonWineOf(withWine));
    }

    // The wine line itself does change: Ren/Nic drop it entirely, Ari absorbs the full bottle.
    const ariWithWine = personItemShares(DINNER_RECEIPT, {}, 'ari').find((s) => s.id === 'vinho');
    const ariExcluded = personItemShares(DINNER_RECEIPT, WINE_EXCLUDED_ASSIGNMENT, 'ari').find((s) => s.id === 'vinho');
    expect(ariWithWine?.amountCents).toBe(1067); // 3200 / 3, rounded
    expect(ariExcluded?.amountCents).toBe(3200); // full bottle, alone

    expect(personItemShares(DINNER_RECEIPT, WINE_EXCLUDED_ASSIGNMENT, 'ren').find((s) => s.id === 'vinho')).toBeUndefined();
    expect(personItemShares(DINNER_RECEIPT, WINE_EXCLUDED_ASSIGNMENT, 'nic').find((s) => s.id === 'vinho')).toBeUndefined();
  });
});

describe('settle() — minimum-transfer beats naive pairwise mesh', () => {
  /**
   * A genuine debt cycle: A owes B 1000 cents, B owes C 1000 cents, C owes A 1000 cents. As a raw
   * transaction log (the "naive pairwise mesh" — one edge per original debt, no netting) that's 3
   * edges. But the debts fully cancel: everyone's net balance is 0. `settle()` operates on net
   * balances, so it correctly produces 0 transfers — strictly fewer than the naive 3.
   */
  const CYCLE_BALANCES: Balance[] = [
    { personId: 'a', net: 0 }, // -1000 (owes B) + 1000 (owed by C) = 0
    { personId: 'b', net: 0 }, // +1000 (owed by A) - 1000 (owes C) = 0
    { personId: 'c', net: 0 }, // +1000 (owed by B) - 1000 (owes A) = 0
  ];
  const NAIVE_PAIRWISE_EDGE_COUNT_FOR_CYCLE = 3; // A->B, B->C, C->A

  it('collapses a fully-cancelling 3-person cycle to zero transfers (naive mesh: 3 edges)', () => {
    const transfers = settle(CYCLE_BALANCES);
    expect(transfers).toEqual([]);
    expect(transfers.length).toBeLessThan(NAIVE_PAIRWISE_EDGE_COUNT_FOR_CYCLE);
  });

  /**
   * A multi-payer, non-cancelling case: two creditors (A +3000, B +3000) and two debtors
   * (C -2000, D -4000). A naive pairwise mesh — every debtor settling with every creditor it has a
   * nonzero relationship with — needs up to debtors x creditors = 2 x 2 = 4 edges. The greedy
   * max-debtor/max-creditor `settle()` consolidates this to n-1 = 3 transfers at most.
   */
  const MULTI_PAYER_BALANCES: Balance[] = [
    { personId: 'a', net: 3000 },
    { personId: 'b', net: 3000 },
    { personId: 'c', net: -2000 },
    { personId: 'd', net: -4000 },
  ];
  const NAIVE_PAIRWISE_EDGE_COUNT_FOR_MULTI_PAYER = 4; // 2 debtors x 2 creditors

  it('consolidates a 4-person multi-payer scenario to fewer transfers than the naive pairwise mesh', () => {
    const transfers = settle(MULTI_PAYER_BALANCES);
    expect(transfers.length).toBeLessThan(NAIVE_PAIRWISE_EDGE_COUNT_FOR_MULTI_PAYER);
    // Every transfer still nets everyone to zero.
    const net: Record<string, number> = { a: 3000, b: 3000, c: -2000, d: -4000 };
    for (const t of transfers) {
      net[t.fromId] += t.amount;
      net[t.toId] -= t.amount;
    }
    expect(Object.values(net).every((n) => n === 0)).toBe(true);
  });
});
