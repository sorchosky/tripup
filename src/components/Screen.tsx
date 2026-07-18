/**
 * Screen — composes the iOS chrome (status bar, nav header, scroll area, sticky glass footer, home
 * indicator) so each screen file only writes its own content. Keeps the 390×844 device contract in one
 * place instead of every screen re-deriving it.
 */

import type { ReactNode } from 'react';
import styles from './Screen.module.css';
import { StatusBar, HomeIndicator, NavHeader, glassClass } from './ui';

interface ScreenProps {
  nav?: ReactNode;
  children: ReactNode;
  /** Sticky glass footer content (e.g. subtotals + CTA). Rendered above the tab bar / home indicator. */
  footer?: ReactNode;
  /** Global liquid-glass tab bar (Trips/Activity/Profile). Rendered below the footer. */
  tabBar?: ReactNode;
  /** Remove the default content padding for full-bleed layouts. */
  bleed?: boolean;
}

export function Screen({ nav, children, footer, tabBar, bleed }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <StatusBar />
      {nav}
      <div className={styles.scroll}>
        <div className={bleed ? undefined : styles.pad}>{children}</div>
      </div>
      {footer ? (
        <div className={styles.footer}>
          <div className={`${styles.footerBar} ${glassClass}`}>{footer}</div>
        </div>
      ) : null}
      {tabBar ? <div className={styles.tabBarSlot}>{tabBar}</div> : null}
      <HomeIndicator />
    </div>
  );
}

export { NavHeader };
