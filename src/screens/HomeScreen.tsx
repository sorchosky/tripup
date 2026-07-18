/**
 * Screen 1 — Home / trip list. Ari opens the app to their trips; the Lisbon trip is the live one and
 * the way into the whole flow.
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Eyebrow, Pill, AvatarGroup } from '../components/ui';
import { Compass, ChevronRight, MapPin } from '../components/icons';
import { TRIP } from '../data/mock';
import { useTrip } from '../state/TripContext';
import styles from './HomeScreen.module.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();
  const memberCount = state.participants.length;

  return (
    <Screen>
      <div className={styles.top}>
        <Compass size={24} />
        <span className={styles.wordmark}>TripUp</span>
      </div>

      <div className={styles.sectionLabel}>
        <Eyebrow>This trip</Eyebrow>
      </div>

      <button type="button" className={styles.hero} onClick={() => navigate('/trip')}>
        <div className={styles.map}>
          {/* Placeholder map graphic — stands in for the "Lisbon map outline" called out in the wireframe. */}
          <svg viewBox="0 0 342 148" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5">
              <path d="M-10 96 C60 78 96 120 150 104 S250 70 360 96" />
              <path d="M-10 116 C70 104 110 138 168 122 S260 96 360 118" />
              <path d="M40 -10 L70 60 L58 150" />
              <path d="M150 -10 L150 40 L120 74 L134 150" />
              <path d="M250 -10 L232 56 L262 150" />
              <path d="M-10 40 L120 40 M180 40 L360 40" />
            </g>
            <path d="M-10 128 C90 118 150 150 360 130 L360 160 L-10 160 Z" fill="rgba(90,69,214,0.35)" />
          </svg>
          <span className={styles.mapPin}>
            <MapPin size={14} />
            {TRIP.destination}
          </span>
        </div>

        <div className={styles.heroBody}>
          <div className={styles.heroTitleRow}>
            <span className={styles.heroTitle}>{TRIP.name}</span>
            <Pill tone="settled">Live</Pill>
          </div>
          <p className={styles.heroSub}>Deciding, splitting, settling — all in one place.</p>

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

      <div className={styles.pastSection}>
        <Eyebrow>Past trips</Eyebrow>
        <div className={styles.empty}>
          <span className={styles.emptyStrong}>Nothing behind you yet.</span> Lisbon&apos;s the first one on
          the board.
        </div>
      </div>
    </Screen>
  );
}
