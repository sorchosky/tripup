/**
 * BottomSheet — a full-height sheet that overlays the Trip Hub, sliding up on entry and back down on
 * close (screen 3, #15). Reusable for any sheet-presented flow reached from the Trip Hub, not just
 * add/edit participants.
 */

import { useState, type ReactNode } from 'react';
import { StatusBar, HomeIndicator, NavHeader } from './ui';
import { X } from './icons';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  title: string;
  /** Called once the slide-down close animation finishes — do the actual navigation here. */
  onClose: () => void;
  children: ReactNode;
  /** Pinned above the home indicator, e.g. a search field that should stay reachable while scrolling. */
  footer?: ReactNode;
}

export function BottomSheet({ title, onClose, children, footer }: BottomSheetProps) {
  const [closing, setClosing] = useState(false);

  return (
    <div
      className={`${styles.sheet} ${closing ? styles.closing : styles.opening}`}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <StatusBar />
      <NavHeader title={title} rightIcon={<X />} onRight={() => setClosing(true)} rightAriaLabel="Close" />
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
      <HomeIndicator />
    </div>
  );
}
