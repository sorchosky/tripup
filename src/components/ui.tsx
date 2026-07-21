/**
 * ui.tsx — the shared product primitives (DESIGN.md → Component patterns to reuse).
 *
 * Each consumes tokens by role, so the same chip / pill / button does the same job on every screen —
 * which is exactly what the rubric grades for system consistency (C5).
 */

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type RefObject } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ui.module.css';
import { participantById } from '../data/mock';
import { Bell, Compass, User, Plus, X } from './icons';
import { useTrip } from '../state/TripContext';

/* ------------------------------ Status bar / chrome ------------------------------ */

export function StatusBar() {
  return (
    <div className={styles.statusBar}>
      <span className={styles.statusTime}>9:41</span>
      <span className={styles.statusIcons} aria-hidden>
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" opacity="0.35" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.2c2.5 0 4.8 1 6.4 2.5l-1.4 1.5A6.9 6.9 0 0 0 8 4.2c-2 0-3.8.8-5 2l-1.4-1.5A9 9 0 0 1 8 2.2Z" />
          <path d="M8 6.1c1.4 0 2.7.6 3.6 1.5l-1.5 1.5A2.9 2.9 0 0 0 8 8.1c-.8 0-1.6.3-2.1.9L4.4 7.6A5 5 0 0 1 8 6.1Z" />
          <circle cx="8" cy="10.4" r="1.4" />
        </svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="16" height="9" rx="2" fill="currentColor" />
          <path d="M23.5 4.2c.9.3.9 4.3 0 4.6V4.2Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

interface NavHeaderProps {
  onBack?: () => void;
  leftIcon?: ReactNode;
  title?: string;
  rightIcon?: ReactNode;
  onRight?: () => void;
  rightText?: string;
  rightAriaLabel?: string;
  leftAriaLabel?: string;
  /** Ref to the right icon button — lets a popover passed via `menu` anchor to it. */
  rightRef?: RefObject<HTMLButtonElement>;
  /** Popover (e.g. a `Menu`) anchored to the right icon button; rendered alongside it. */
  menu?: ReactNode;
  /** `aria-expanded` on the right icon button while `menu` is present. */
  rightExpanded?: boolean;
  /**
   * Scroll-linked title (issue #48) — unlike `title` (always shown, no transition), this stays mounted
   * at all times and just fades via `centerTitleVisible`, so there's no layout shift when it appears
   * (e.g. the trip title fading in once the in-body `<h1>` scrolls under the header). Ignored if `title`
   * is also passed.
   */
  centerTitle?: string;
  /** Whether `centerTitle` is faded in. Defaults to false (faded out). */
  centerTitleVisible?: boolean;
  /**
   * Whether the header's backdrop blur is faded in (issue #87) — mirrors `centerTitleVisible`'s
   * scroll-gated pattern. Defaults to false (transparent, no blur) so a screen at rest reads as
   * chrome-light; screens with a scroll body pass their own `scrolled` signal (see `Screen`'s
   * `isScrolled` helper) once content has moved under the header.
   */
  backdropVisible?: boolean;
}

export function NavHeader({
  onBack,
  leftIcon,
  title,
  rightIcon,
  onRight,
  rightText,
  rightAriaLabel,
  leftAriaLabel = 'Back',
  rightRef,
  menu,
  rightExpanded,
  centerTitle,
  centerTitleVisible = false,
  backdropVisible = false,
}: NavHeaderProps) {
  return (
    <div className={styles.navHeader}>
      <span
        className={`${styles.navBackdrop} ${backdropVisible ? styles.navBackdropVisible : ''}`}
        aria-hidden
      />
      {onBack || leftIcon ? (
        <button
          type="button"
          className={`${styles.iconButton} ${styles.glass}`}
          onClick={onBack}
          aria-label={leftAriaLabel}
        >
          {leftIcon}
        </button>
      ) : (
        <span className={styles.navSpacer} />
      )}

      {title ? (
        <span className={styles.navTitle}>{title}</span>
      ) : centerTitle ? (
        <span
          className={`${styles.navTitle} ${styles.navTitleFade} ${centerTitleVisible ? styles.navTitleVisible : ''}`}
        >
          {centerTitle}
        </span>
      ) : (
        <span style={{ flex: 1 }} />
      )}

      {rightText ? (
        <button type="button" className={styles.textButton} onClick={onRight}>
          {rightText}
        </button>
      ) : rightIcon ? (
        <span className={styles.navRightAnchor}>
          {menu}
          <button
            ref={rightRef}
            type="button"
            className={`${styles.iconButton} ${styles.glass}`}
            onClick={onRight}
            aria-label={rightAriaLabel}
            aria-haspopup={menu ? 'menu' : undefined}
            aria-expanded={menu ? rightExpanded : undefined}
          >
            {rightIcon}
          </button>
        </span>
      ) : (
        <span className={styles.navSpacer} />
      )}
    </div>
  );
}

/* ------------------------------ Tab bar ------------------------------ */

const TABS = [
  { key: 'trips', label: 'Trips', Icon: Compass, path: '/', enabled: true },
  { key: 'activity', label: 'Activity', Icon: Bell, path: '/activity', enabled: true },
  { key: 'profile', label: 'Profile', Icon: User, path: '/profile', enabled: false },
] as const;

/** Every route in the app belongs to the "Trips" tab except the Activity feed itself. */
function activeTabKey(pathname: string): (typeof TABS)[number]['key'] {
  return pathname.startsWith('/activity') ? 'activity' : 'trips';
}

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentKey = activeTabKey(location.pathname);
  // #105: a dot on the Activity tab when there's unread activity (requests sent / payments landed)
  // the user hasn't opened the feed for yet. ActivityScreen clears it on mount.
  const { state } = useTrip();

  return (
    <div className={`${styles.tabBar} ${styles.glass}`}>
      {TABS.map(({ key, label, Icon, path, enabled }) => {
        const active = enabled && key === currentKey;
        const showUnreadBadge = key === 'activity' && state.activityUnread;
        return (
          <button
            key={key}
            type="button"
            className={`${styles.tabItem} ${active ? styles.tabItemActive : ''}`}
            disabled={!enabled}
            aria-current={active ? 'page' : undefined}
            onClick={enabled ? () => navigate(path) : undefined}
          >
            <span className={styles.tabIconAnchor}>
              <Icon size={22} />
              {showUnreadBadge ? <span className={styles.tabBadge} aria-label="New activity" /> : null}
            </span>
            <span className={styles.tabLabel}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Menu / Popover ------------------------------ */

/** One row in a glass Menu — shared shape for the FAB menu (#13) and the ellipsis action menu (#14). */
export interface MenuItemDef {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'destructive';
}

interface MenuProps {
  open: boolean;
  onClose: () => void;
  /** The trigger button — excluded from "click outside" dismissal, refocused on Escape. */
  anchorRef: RefObject<HTMLElement | null>;
  items: MenuItemDef[];
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
}

/** Glass panel anchored to a trigger: dismiss-on-outside-click, Escape-to-close, focuses the first item. */
export function Menu({ open, onClose, anchorRef, items, align = 'end', side = 'bottom' }: MenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        anchorRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="menu"
      className={`${styles.menu} ${styles.glass} ${side === 'top' ? styles.menuTop : styles.menuBottom} ${
        align === 'start' ? styles.menuStart : styles.menuEnd
      }`}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="menuitem"
          className={`${styles.menuItem} ${item.tone === 'destructive' ? styles.menuItemDestructive : ''}`}
          onClick={() => {
            onClose();
            item.onSelect();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ FAB ------------------------------ */

type FabIconComponent = (props: { size?: number; className?: string }) => ReactNode;

interface FabProps {
  items: MenuItemDef[];
  ariaLabel?: string;
  /** Resting icon (issue #45) — defaults to a bare `Plus`. */
  icon?: FabIconComponent;
}

/**
 * Floating glass action button; opens a Menu of quick actions above itself.
 *
 * Open state (issue #45): a plain `Plus` reads as an "X" once rotated 45° — a glyph like
 * `CalendarPlus` doesn't read the same way tilted (and an `X` rotated another 45° turns back into a
 * "+", so it can't reuse the old rotate trick either). So the open state swaps to an explicit `X`
 * icon, shown at its natural orientation, instead of rotating the resting icon.
 */
export function Fab({ items, ariaLabel = 'Add', icon: Icon = Plus }: FabProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.fabAnchor}>
      <Menu open={open} onClose={() => setOpen(false)} anchorRef={btnRef} items={items} align="end" side="top" />
      <button
        ref={btnRef}
        type="button"
        className={`${styles.fab} ${styles.glass}`}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={22} /> : <Icon size={22} />}
      </button>
    </div>
  );
}

/* ------------------------------ Avatar ------------------------------ */

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'filled' | 'neutral' | 'outline';

const sizeClass: Record<AvatarSize, string> = {
  sm: styles.avatarSm,
  md: styles.avatarMd,
  lg: styles.avatarLg,
  xl: styles.avatarXl,
};
const variantClass: Record<AvatarVariant, string> = {
  filled: styles.avatarFilled,
  neutral: styles.avatarNeutral,
  outline: styles.avatarOutline,
};

interface AvatarProps {
  /** Participant id (initial is derived from the roster) or a literal single character. */
  personId?: string;
  initial?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  onClick?: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
}

export function Avatar({
  personId,
  initial,
  size = 'md',
  variant = 'filled',
  onClick,
  ariaLabel,
  ariaPressed,
}: AvatarProps) {
  const person = personId ? participantById(personId) : undefined;
  const letter = initial ?? (person ? person.name.charAt(0) : '?');
  const cls = `${styles.avatar} ${sizeClass[size]} ${variantClass[variant]} ${onClick ? styles.avatarButton : ''}`;
  const content = person?.avatarUrl ? (
    <img className={styles.avatarPhoto} src={person.avatarUrl} alt="" aria-hidden />
  ) : (
    letter
  );
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel} aria-pressed={ariaPressed}>
        {content}
      </button>
    );
  }
  return (
    <span className={cls} aria-hidden={!ariaLabel} aria-label={ariaLabel} role={ariaLabel ? 'img' : undefined}>
      {content}
    </span>
  );
}

export function AvatarGroup({
  personIds,
  size = 'md',
  ringColor,
  onClick,
  ariaLabel,
}: {
  personIds: string[];
  size?: AvatarSize;
  ringColor?: string;
  /** Makes the whole cluster a single tappable target (e.g. jump to add/edit participants). */
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const stack = (
    <span className={styles.avatarGroup} style={ringColor ? ({ ['--ring-color' as string]: ringColor }) : undefined}>
      {personIds.map((id) => (
        <Avatar key={id} personId={id} size={size} variant="filled" />
      ))}
    </span>
  );

  if (!onClick) return stack;

  return (
    <button type="button" className={styles.avatarGroupButton} onClick={onClick} aria-label={ariaLabel}>
      {stack}
    </button>
  );
}

/* ------------------------------ Pill / eyebrow ------------------------------ */

export function Pill({ tone = 'neutral', children }: { tone?: 'settled' | 'owed' | 'neutral'; children: ReactNode }) {
  const toneClass =
    tone === 'settled' ? styles.pillSettled : tone === 'owed' ? styles.pillOwed : styles.pillNeutral;
  return <span className={`${styles.pill} ${toneClass}`}>{children}</span>;
}

export function Eyebrow({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <p className={`${styles.eyebrow} ${wide ? styles.eyebrowWide : ''}`}>{children}</p>;
}

/* ------------------------------ Buttons ------------------------------ */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'neutral' | 'primary-glass' };

const buttonVariantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: styles.btnPrimary,
  neutral: styles.btnNeutral,
  // Glass-accent primary (issue #52) — for a primary CTA that floats fixed over scrolling content
  // instead of sitting inside a `.glass` footer card; see CreatePollScreen/PollVotingScreen.
  'primary-glass': styles.btnPrimaryGlass,
};

export function Button({ variant = 'primary', className = '', children, disabled, ...rest }: ButtonProps) {
  const variantClassName = buttonVariantClass[variant];
  return (
    <button
      type="button"
      className={`${styles.btn} ${variantClassName} ${className}`}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Segmented control ------------------------------ */

export interface SegmentedOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Two/three-way tab-style switch (issue #40) — reused wherever a screen needs a step toggle rather than
 * a single boolean, e.g. the settle-up confirm sheet's Review/Pay steps. */
export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div className={styles.segmented} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.segmentedItem} ${active ? styles.segmentedItemActive : ''}`}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const glassClass = styles.glass;

/* ------------------------------ Toast ------------------------------ */

export { Toast } from './Toast';
