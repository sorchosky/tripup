/**
 * MealCostDonut — the Settle Up hero chart (issue #99), replacing the earlier binary `SettleRing`
 * (issue #39). That ring plotted a single settled/unsettled boolean; this donut instead plots the
 * actual composition of the meal cost: `DINNER_RECEIPT.totalCents` split into the portion that's
 * already accounted for (Ari's own share — never anyone else's debt) and the portion still outstanding
 * (`oweTotal`, what the other participants still owe Ari back). Both segments — and the centered label —
 * are driven straight off derived state, so the split recomputes automatically if the assignment or
 * exclusions change; nothing here is a hardcoded amount.
 *
 * Two stroke-dasharray arcs on the same circle, laid end to end (paid arc starting at 12 o'clock,
 * outstanding arc picking up where it left off) rather than a single interpolated progress fraction —
 * this is a composition of two segments, not a meter filling toward completion.
 */

import { euros } from '../lib/format';
import styles from './MealCostDonut.module.css';

interface MealCostDonutProps {
  /** Full meal cost, euro cents (DINNER_RECEIPT.totalCents). */
  totalCents: number;
  /** What's still owed back to Ari, euro cents (derived from settle.ts's transfers). */
  outstandingCents: number;
}

// viewBox-space geometry, not CSS pixels — same precedent as icons.tsx and the ring it replaces.
const VIEWBOX = 100;
const CENTER = VIEWBOX / 2;
const RADIUS = 42;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MealCostDonut({ totalCents, outstandingCents }: MealCostDonutProps) {
  const outstandingFraction = totalCents > 0 ? Math.min(1, Math.max(0, outstandingCents / totalCents)) : 0;
  const paidLength = CIRCUMFERENCE * (1 - outstandingFraction);
  const outstandingLength = CIRCUMFERENCE * outstandingFraction;

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        role="img"
        aria-label={`${euros(outstandingCents)} still outstanding, out of ${euros(totalCents)} for the dinner.`}
      >
        <circle
          className={styles.paidArc}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${paidLength} ${CIRCUMFERENCE - paidLength}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
        <circle
          className={styles.outstandingArc}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${outstandingLength} ${CIRCUMFERENCE - outstandingLength}`}
          strokeDashoffset={-paidLength}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
      </svg>
      <div className={styles.center} aria-hidden>
        <span className={styles.amount}>{euros(outstandingCents)}</span>
        <span className={styles.label}>still outstanding</span>
      </div>
    </div>
  );
}
