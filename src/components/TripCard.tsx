/**
 * TripCard — shared trip summary card (DESIGN.md → Component patterns to reuse).
 *
 * `hero`: the single active-trip card (map banner, status, avatars, spend) — used once, for the live
 * trip on Home. `row`: a condensed dock-style summary (small thumbnail + name + dates) for the
 * Upcoming/Past lists, so those stay glanceable and don't compete visually with the hero.
 */

import type { ComponentType } from 'react';
import styles from './TripCard.module.css';
import { Pill, AvatarGroup } from './ui';
import { ChevronRight, MapPin } from './icons';
import type { TripStatus } from '../data/mock';
import { formatDateRange, daysLeft } from '../lib/dates';

function statusPill(status: TripStatus) {
  if (status === 'live') return <Pill tone="settled">Live</Pill>;
  if (status === 'upcoming') return <Pill tone="neutral">Upcoming</Pill>;
  return <Pill tone="neutral">Past</Pill>;
}

function formatSpend(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

interface TripCardBase {
  name: string;
  destination: string;
  dates: { start: string; end: string };
  Skyline: ComponentType;
}

interface TripCardHeroProps extends TripCardBase {
  variant: 'hero';
  status: TripStatus;
  spendCents: number;
  participantIds: string[];
  onClick?: () => void;
}

interface TripCardRowProps extends TripCardBase {
  variant: 'row';
}

type TripCardProps = TripCardHeroProps | TripCardRowProps;

export function TripCard(props: TripCardProps) {
  const { Skyline, name, destination, dates } = props;

  if (props.variant === 'row') {
    return (
      <div className={styles.row}>
        <span className={styles.rowThumb}>
          <Skyline />
        </span>
        <div className={styles.rowBody}>
          <div className={styles.rowTitle}>{name}</div>
          <p className={styles.rowSub}>{formatDateRange(dates.start, dates.end)}</p>
        </div>
        <ChevronRight size={18} className={styles.rowChevron} />
      </div>
    );
  }

  const { status, spendCents, participantIds, onClick } = props;
  const days = daysLeft(dates.end);

  return (
    <button type="button" className={styles.hero} onClick={onClick}>
      <div className={styles.map}>
        <Skyline />
        <span className={styles.mapPin}>
          <MapPin size={14} />
          {destination}
        </span>
      </div>

      <div className={styles.heroBody}>
        <div className={styles.heroTitleRow}>
          <span className={styles.heroTitle}>{name}</span>
          {statusPill(status)}
        </div>
        <p className={styles.heroSub}>
          {formatDateRange(dates.start, dates.end)} · {days} day{days === 1 ? '' : 's'} left ·{' '}
          {formatSpend(spendCents)} spent
        </p>

        <div className={styles.heroFooter}>
          <div className={styles.heroMembers}>
            <AvatarGroup personIds={participantIds} size="md" ringColor="var(--color-surface-raised)" />
            <span className={styles.heroMembersLabel}>{participantIds.length} in the group</span>
          </div>
          <ChevronRight size={20} />
        </div>
      </div>
    </button>
  );
}
