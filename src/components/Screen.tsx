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
  /**
   * Float the footer over the scrolling content instead of stacking below it in flex flow, so the
   * `.glass` blur has something scrolled behind it to actually blur (otherwise it just reads as a
   * solid rounded bar). Also suppresses the home indicator, which otherwise adds a margin below the
   * floating bar that doesn't match the hi-fi pattern. Opt-in per screen — most footers (settle-up,
   * poll voting) are meant to read as fixed device chrome, not overlay content.
   */
  floatingFooter?: boolean;
}

export function Screen({ nav, children, footer, tabBar, bleed, floatingFooter }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <StatusBar />
      {nav}
      <div className={`${styles.scroll} ${floatingFooter ? styles.scrollUnderFooter : ''}`}>
        <div className={bleed ? styles.bleedFill : styles.pad}>{children}</div>
      </div>
      {footer ? (
        <div className={`${styles.footer} ${floatingFooter ? styles.footerFloating : ''}`}>
          <div className={`${styles.footerBar} ${glassClass}`}>{footer}</div>
        </div>
      ) : null}
      {tabBar ? <div className={styles.tabBarSlot}>{tabBar}</div> : null}
      {floatingFooter ? null : <HomeIndicator />}
    </div>
  );
}

export { NavHeader };
