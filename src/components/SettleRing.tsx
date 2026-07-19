/**
 * SettleRing — the settlement progress ring on Settle Up (issue #39), replacing the flat "you're owed
 * €X" numeral with a radial meter. Driven by real derived state, not a hardcoded percentage:
 *  - `settled` is a single boolean today (src/state/TripContext.tsx), so the fill fraction is binary —
 *    0% (outstanding) before SETTLE fires, 100% (settled) after. A per-transfer partial-fill concept
 *    isn't modeled by the current state shape and would be new scope, not a trivial addition here.
 *  - The arc's color interpolates continuously from `--color-owed` (amber) to `--color-settled`
 *    (green) via `color-mix`, driven off the same fraction that draws the arc — at no point does it
 *    jump straight from one flat color to the other.
 *  - On the 0 → 1 transition (SETTLE dispatching), the ring animates to a complete green ring;
 *    `prefers-reduced-motion` jumps straight to the end state instead.
 *
 * Geometry (radius/stroke/circumference) is expressed in unitless SVG viewBox coordinates rather than
 * CSS px, same precedent as the icon set in `icons.tsx` — the ring's actual rendered footprint comes
 * from the `--ring-size` token (tokens.css) via the wrapping element, so this stays consistent with the
 * "no raw px" component contract without hand-syncing two separate box models.
 */

import { useEffect, useRef, useState } from 'react';
import { euros } from '../lib/format';
import styles from './SettleRing.module.css';

interface SettleRingProps {
  /** Outstanding total in euro cents (derived.transfers summed) — shown at 0 once settled. */
  outstandingCents: number;
  settled: boolean;
}

// viewBox-space geometry, not CSS pixels — see file header.
const VIEWBOX = 100;
const CENTER = VIEWBOX / 2;
const RADIUS = 42;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIMATION_MS = 700;

function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function SettleRing({ outstandingCents, settled }: SettleRingProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(settled ? 1 : 0);
  const rafRef = useRef<number | null>(null);
  const prevSettled = useRef(settled);

  useEffect(() => {
    // Only the false → true transition animates; every other render (initial mount, or the already-
    // settled/already-unsettled case) jumps straight to the target — nothing to sweep through.
    if (settled === prevSettled.current) return;
    prevSettled.current = settled;

    if (!settled) {
      setProgress(0);
      return;
    }

    if (reducedMotion) {
      setProgress(1);
      return;
    }

    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const eased = 1 - (1 - t) ** 3; // ease-out cubic
      setProgress(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [settled, reducedMotion]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const arcStyle = { ['--progress' as string]: `${progress * 100}%` };

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        role="img"
        aria-label={
          settled
            ? "Settled — everyone's even."
            : `${euros(outstandingCents)} still outstanding.`
        }
      >
        <circle className={styles.track} cx={CENTER} cy={CENTER} r={RADIUS} strokeWidth={STROKE} fill="none" />
        <circle
          className={styles.arc}
          style={arcStyle}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
      </svg>
      <div className={styles.center} aria-hidden>
        <span className={styles.amount}>{euros(settled ? 0 : outstandingCents)}</span>
        <span className={styles.label}>{settled ? 'Everyone’s even' : 'Still outstanding'}</span>
      </div>
    </div>
  );
}
