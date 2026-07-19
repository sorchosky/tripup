/**
 * BottomSheet — a sheet that overlays the current screen, sliding up on entry and back down on close.
 * Two chrome variants (issue #40):
 *  - `full` (default) — the original full-height sheet used as a routed screen state (screen 3, #15):
 *    its own StatusBar + NavHeader, covers the whole device frame.
 *  - `partial` — a shorter, bottom-anchored sheet presented *over* the current screen (not a route
 *    change) with a dismissible scrim behind it, no StatusBar (it doesn't cover the notch), rounded top
 *    corners so it reads as a card rising from the bottom rather than a second full screen. Used by the
 *    Settle Up confirm flow.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { NavHeader, StatusBar } from './ui';
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
    if (variant !== 'partial') return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') requestClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const sheet = (
    <div
      className={`${styles.sheet} ${variant === 'partial' ? styles.sheetPartial : ''} ${
        closing ? (variant === 'partial' ? styles.closingPartial : styles.closing) : styles.opening
      }`}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
      role={variant === 'partial' ? 'dialog' : undefined}
      aria-modal={variant === 'partial' ? true : undefined}
      aria-label={variant === 'partial' ? title : undefined}
    >
      {variant === 'full' ? <StatusBar /> : null}
      <NavHeader title={title} rightIcon={<X />} onRight={requestClose} rightAriaLabel="Close" />
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );

  if (variant === 'partial') {
    return (
      <div className={styles.overlay}>
        <button
          type="button"
          className={`${styles.scrim} ${closing ? styles.scrimClosing : styles.scrimOpening}`}
          onClick={requestClose}
          aria-label="Dismiss"
          tabIndex={-1}
        />
        {sheet}
      </div>
    );
  }

  return sheet;
}
