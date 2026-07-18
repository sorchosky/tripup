/**
 * Screen 6 — Poll closed → itinerary updated. HIGH-FIDELITY port of `poll-status-and-reveal` (29:2750).
 *
 * The poll result is read from shared state (set by CLOSE_POLL on the voting screen), and the winner
 * card's "Added to Lisbon 2026" line reflects the real itinerary write that the same action performed —
 * so this screen shows a genuine transition, not a static mock.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Pill, Eyebrow } from '../components/ui';
import { ArrowLeft, Check } from '../components/icons';
import { DINNER_POLL, TRIP } from '../data/mock';
import { useTrip } from '../state/TripContext';
import styles from './PollClosedScreen.module.css';

export default function PollClosedScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();

  // If someone lands here without playing the poll, resolve it so the screen is never empty.
  useEffect(() => {
    if (state.poll.status !== 'closed') dispatch({ type: 'CLOSE_POLL' });
  }, [state.poll.status, dispatch]);

  const ranked = [...state.poll.options].sort((a, b) => b.votes - a.votes);
  const winner = ranked.find((o) => o.id === (state.poll.winnerId ?? DINNER_POLL.winnerId)) ?? ranked[0];
  const votesIn = state.poll.options.reduce((n, o) => n + o.votes, 0);

  return (
    <Screen
      bleed
      nav={
        <NavHeader
          onBack={() => navigate('/trip')}
          leftIcon={<ArrowLeft />}
          leftAriaLabel="Back to trip"
          rightIcon={<Check size={20} />}
          rightAriaLabel="Done"
          onRight={() => navigate('/trip')}
        />
      }
    >
      <div className={styles.body}>
        <h1 className={styles.title}>{state.poll.question}</h1>

        <div className={styles.context}>
          <Pill tone="settled">Poll closed</Pill>
          <span className={styles.closedAt}>Closed {state.poll.closedAt}</span>
        </div>

        <div className={styles.spacer} />

        <div className={styles.winnerCard}>
          <div className={styles.media}>
            <span className={styles.winnerBadge}>Winner</span>
          </div>
          <div className={styles.winnerBody}>
            <p className={styles.venue}>{winner.name}</p>
            <p className={styles.venueMeta}>{DINNER_POLL.winnerMeta}</p>
          </div>
          <div className={styles.separator} />
          <div className={styles.addedRow}>
            <Check size={16} />
            <span>Added to {TRIP.name}</span>
          </div>
        </div>

        <div className={styles.spacer} />

        <section className={styles.results}>
          <Eyebrow wide>
            Results · {votesIn}/{state.participants.length} voted
          </Eyebrow>
          {ranked.map((option, i) => {
            const lead = i === 0;
            return (
              <div key={option.id} className={styles.resultRow}>
                <div className={styles.resultLeft}>
                  <span className={`${styles.rankBadge} ${lead ? styles.rankLead : styles.rankOther}`}>
                    {i + 1}
                  </span>
                  <span className={`${styles.optionName} ${lead ? styles.optionLead : styles.optionOther}`}>
                    {option.name}
                  </span>
                </div>
                <span className={`${styles.votes} ${lead ? styles.votesLead : styles.votesOther}`}>
                  {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            );
          })}
        </section>
      </div>
    </Screen>
  );
}
