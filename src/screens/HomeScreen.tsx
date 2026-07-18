/**
 * Screen 1 — Home / trip list. Ari opens the app to their trips; the Lisbon trip is the live one and
 * the way into the whole flow.
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Eyebrow, TabBar } from '../components/ui';
import { TripCard } from '../components/TripCard';
import { Compass } from '../components/icons';
import { TRIP, TRIPS } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { LisbonSkyline } from '../assets/skylines';
import styles from './HomeScreen.module.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();
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

      <TripCard
        variant="hero"
        name={TRIP.name}
        destination={TRIP.destination}
        status={TRIP.status}
        dates={TRIP.dates}
        spendCents={TRIP.spendCents}
        participantIds={state.participants.map((p) => p.id)}
        Skyline={LisbonSkyline}
        onClick={() => navigate('/trip')}
      />

      {upcoming.length > 0 ? (
        <div className={styles.pastSection}>
          <Eyebrow>Upcoming</Eyebrow>
          <div className={styles.cardStack}>
            {upcoming.map((trip) => (
              <TripCard
                key={trip.id}
                variant="row"
                name={trip.name}
                destination={trip.destination}
                dates={trip.dates}
                Skyline={trip.Skyline}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.pastSection}>
        <Eyebrow>Past trips</Eyebrow>
        {past.length > 0 ? (
          <div className={styles.cardStack}>
            {past.map((trip) => (
              <TripCard
                key={trip.id}
                variant="row"
                name={trip.name}
                destination={trip.destination}
                dates={trip.dates}
                Skyline={trip.Skyline}
              />
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
