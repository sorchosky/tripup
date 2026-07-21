/**
 * Toast — a lightweight, auto-dismissing confirmation banner pinned to the top of the 390×844 frame
 * (issue #90). Generic by design: any screen can fire one off a `message` string (e.g. the
 * add/edit-participants sheet's "{Name} has been added to the trip." on `ADD_PARTICIPANT`) rather than
 * this being a one-off built for that single call site.
 *
 * Reuses the same frosted `.glass` chrome treatment as the tab bar / FAB (`glassClass`, `ui.tsx`) so a
 * transient banner still reads as the same system as the persistent chrome around it, rather than a new
 * one-off surface.
 */

import { useEffect } from 'react';
import { glassClass } from './ui';
import { X } from './icons';
import styles from './Toast.module.css';

interface ToastProps {
  /** Rendered when non-null; passing `null` (or unmounting) hides it. */
  message: string | null;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

export function Toast({ message, onDismiss, duration = 3200 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className={styles.wrap}>
      <div className={`${styles.toast} ${glassClass}`} role="status" aria-live="polite">
        <span className={styles.message}>{message}</span>
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
