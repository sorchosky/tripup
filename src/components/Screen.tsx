/**
 * Screen — composes the iOS chrome (status bar, nav header, scroll area, sticky glass footer) so each
 * screen file only writes its own content. Keeps the 390×844 device contract in one place instead of
 * every screen re-deriving it.
 */

import type { ReactNode, UIEvent } from 'react';
import styles from './Screen.module.css';
import { StatusBar, NavHeader, glassClass } from './ui';

interface ScreenProps {
  nav?: ReactNode;
  children: ReactNode;
  /** Sticky glass footer content (e.g. subtotals + CTA). Floats above the tab bar / scroll content. */
  footer?: ReactNode;
  /** Global liquid-glass tab bar (Trips/Activity/Profile). Floats below the footer. */
  tabBar?: ReactNode;
  /** Remove the default content padding for full-bleed layouts. */
  bleed?: boolean;
  /**
   * Scroll signal for the content area (issue #48) — e.g. so a screen can fade an in-body heading into
   * the floating `nav` header once it scrolls underneath it. Omit for screens that don't need it.
   */
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
}

export function Screen({ nav, children, footer, tabBar, bleed, onScroll }: ScreenProps) {
  const scrollPadTop = nav ? styles.scrollPadTopNav : '';
  const scrollPadBottom =
    footer && tabBar
      ? styles.scrollPadBottomFooterAndTabBar
      : footer
      ? styles.scrollPadBottomFooter
      : tabBar
      ? styles.scrollPadBottomTabBar
      : styles.scrollPadBottomHome;

  return (
    <div className={styles.screen}>
      <StatusBar />
      <div className={styles.body}>
        <div className={`${styles.scroll} ${scrollPadTop} ${scrollPadBottom}`} onScroll={onScroll}>
          <div className={bleed ? styles.bleedFill : styles.pad}>{children}</div>
        </div>
        {nav ? <div className={styles.navFloating}>{nav}</div> : null}
        {footer ? (
          <div className={`${styles.footerFloating} ${tabBar ? styles.footerFloatingAboveTabBar : ''}`}>
            <div className={`${styles.footerBar} ${glassClass}`}>{footer}</div>
          </div>
        ) : null}
        {tabBar ? <div className={styles.tabBarFloating}>{tabBar}</div> : null}
      </div>
    </div>
  );
}

export { NavHeader };
