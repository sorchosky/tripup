/**
 * Screen 1 — Home / trip list. Ari opens the app to their trips; the Lisbon trip is the live one and
 * the way into the whole flow.
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Eyebrow, Pill, AvatarGroup, TabBar } from '../components/ui';
import { Compass, ChevronRight, MapPin } from '../components/icons';
import { TRIP, TRIPS, type TripStatus, type TripSummary } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { formatDateRange, daysLeft } from '../lib/dates';
import { LisbonSkyline } from '../assets/skylines';
import styles from './HomeScreen.module.css';

function statusPill(status: TripStatus) {
  if (status === 'live') return <Pill tone="settled">Live</Pill>;
  if (status === 'upcoming') return <Pill tone="neutral">Upcoming</Pill>;
  return <Pill tone="neutral">Past</Pill>;
}

function formatSpend(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Non-interactive summary card for Tokyo/Paris — no detail flow exists for them yet. */
function TripCard({ trip }: { trip: TripSummary }) {
  const Skyline = trip.Skyline;
  const daysLabel =
    trip.status === 'upcoming' ? `${daysLeft(trip.dates.start)} days to go` : undefined;

  return (
    <div className={styles.hero}>
      <div className={styles.map}>
        <Skyline />
        <span className={styles.mapPin}>
          <MapPin size={14} />
          {trip.destination}
        </span>
      </div>

      <div className={styles.heroBody}>
        <div className={styles.heroTitleRow}>
          <span className={styles.heroTitle}>{trip.name}</span>
          {statusPill(trip.status)}
        </div>
        <p className={styles.heroSub}>
          {formatDateRange(trip.dates.start, trip.dates.end)}
          {daysLabel ? ` · ${daysLabel}` : ''} · {formatSpend(trip.spendCents)} spent
        </p>

        <div className={styles.heroFooter}>
          <div className={styles.heroMembers}>
            <AvatarGroup personIds={trip.participantIds} size="md" ringColor="var(--color-surface-raised)" />
            <span className={styles.heroMembersLabel}>{trip.participantIds.length} in the group</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();
  const memberCount = state.participants.length;
  const upcoming = TRIPS.filter((t) => t.status === 'upcoming');
  const past = TRIPS.filter((t) => t.status === 'past');

  return (
    <Screen tabBar={<TabBar />}>
      <div className={styles.top}>
        <Compass size={24} />
        <span className={styles.wordmark}>TripUp</span>
      </div>

      <div className={styles.sectionLabel}>
        <Eyebrow>This trip</Eyebrow>
      </div>

      <button type="button" className={styles.hero} onClick={() => navigate('/trip')}>
        <div className={styles.map}>
          <LisbonSkyline />
          <span className={styles.mapPin}>
            <MapPin size={14} />
            {TRIP.destination}
          </span>
        </div>

        <div className={styles.heroBody}>
          <div className={styles.heroTitleRow}>
            <span className={styles.heroTitle}>{TRIP.name}</span>
            {statusPill(TRIP.status)}
          </div>
          <p className={styles.heroSub}>
            {formatDateRange(TRIP.dates.start, TRIP.dates.end)} · {daysLeft(TRIP.dates.end)} day
            {daysLeft(TRIP.dates.end) === 1 ? '' : 's'} left · {formatSpend(TRIP.spendCents)} spent
          </p>

          <div className={styles.heroFooter}>
            <div className={styles.heroMembers}>
              <AvatarGroup personIds={state.participants.map((p) => p.id)} size="md" ringColor="var(--color-surface-raised)" />
              <span className={styles.heroMembersLabel}>
                {memberCount} in the group
              </span>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
      </button>

      {upcoming.length > 0 ? (
        <div className={styles.pastSection}>
          <Eyebrow>Upcoming</Eyebrow>
          <div className={styles.cardStack}>
            {upcoming.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.pastSection}>
        <Eyebrow>Past trips</Eyebrow>
        {past.length > 0 ? (
          <div className={styles.cardStack}>
            {past.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyStrong}>Nothing behind you yet.</span> Lisbon&apos;s the first
            one on the board.
          </div>
        )}
      </div>
    </Screen>
  );
}
