/**
 * BottomSheet — a sheet that overlays the current screen (never its own routed full page), sliding up
 * on entry and back down on close. Self-contained: no own status bar or new-screen chrome — just a
 * scrim, a grabber, the title, and the close affordance, so it reads as something dropped on top of the
 * screen behind it rather than a fresh route.
 *
 * Two chrome variants (issue #40):
 *  - `full` (default) — the full-height sheet used for routed screen states (screen 3, #15/#51):
 *    overlays the still-visible screen behind it (its own status bar peeks through above the sheet).
 *  - `partial` — a shorter, bottom-anchored sheet presented over the current screen (not a route
 *    change). Used by the Settle Up confirm flow.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { NavHeader } from './ui';
import { X } from './icons';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  title: string;
  /** Called once the slide-down close animation finishes — do the actual navigation here. */
  onClose: () => void;
  children: ReactNode;
  /** Pinned to the bottom of the sheet, e.g. a search field that should stay reachable while scrolling. */
  footer?: ReactNode;
  /** `full` (default) = routed full-height sheet. `partial` = shorter overlay sheet with a scrim. */
  variant?: 'full' | 'partial';
}

export function BottomSheet({ title, onClose, children, footer, variant = 'full' }: BottomSheetProps) {
  const [closing, setClosing] = useState(false);
  const requestClose = () => setClosing(true);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') requestClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={`${styles.scrim} ${closing ? styles.scrimClosing : styles.scrimOpening}`}
        onClick={requestClose}
        aria-label="Dismiss"
        tabIndex={-1}
      />
      <div
        className={`${styles.sheet} ${variant === 'partial' ? styles.sheetPartial : ''} ${
          closing ? (variant === 'partial' ? styles.closingPartial : styles.closing) : styles.opening
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onAnimationEnd={() => {
          if (closing) onClose();
        }}
      >
        <span className={styles.grabber} aria-hidden />
        <NavHeader title={title} rightIcon={<X />} onRight={requestClose} rightAriaLabel="Close" />
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
