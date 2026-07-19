/**
 * Screen 5 — Poll voting (live). The votes arrive on a timer so the counts, the bars and the leader all
 * update on screen: Ari's vote lands first, then Ren, then Nic. Each vote is a real CAST_VOTE action, so
 * the tally the next screen reveals is whatever actually came in here. Ari can also close early.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Button, Avatar } from '../components/ui';
import { ArrowLeft } from '../components/icons';
import { useTrip } from '../state/TripContext';
import styles from './PollVotingScreen.module.css';

/** Who votes for what, and when — the choreography behind the "live" feel. */
const VOTE_SEQUENCE: { voterId: string; optionId: string; delay: number }[] = [
  { voterId: 'ari', optionId: 'cervejaria-ramiro', delay: 450 },
  { voterId: 'ren', optionId: 'cervejaria-ramiro', delay: 1600 },
  { voterId: 'nic', optionId: 'time-out-market', delay: 2800 },
];

export default function PollVotingScreen() {
  const navigate = useNavigate();
  const { state, dispatch, derived } = useTrip();

  useEffect(() => {
    const timers = VOTE_SEQUENCE.map(({ voterId, optionId, delay }) =>
      setTimeout(() => dispatch({ type: 'CAST_VOTE', optionId, voterId }), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [dispatch]);

  const votedIds = new Set(state.poll.options.flatMap((o) => o.votedBy));
  const allIn = derived.votesIn >= state.participants.length;
  const stillOut = state.participants.filter((p) => !votedIds.has(p.id)).map((p) => p.name);

  function close() {
    dispatch({ type: 'CLOSE_POLL' });
    navigate('/poll/closed');
  }

  return (
    <Screen
      nav={<NavHeader onBack={() => navigate('/trip')} leftIcon={<ArrowLeft />} leftAriaLabel="Back to trip" />}
      floatingFooter
      footer={
        <Button variant="primary-glass" onClick={close}>
          {allIn ? 'See the result' : 'Close poll now'}
        </Button>
      }
    >
      <div className={styles.body}>
        <h1 className={styles.title}>{state.poll.question}</h1>

        <div className={styles.status}>
          <span className={styles.voterDots}>
            {state.participants.map((p) => (
              <span key={p.id} className={votedIds.has(p.id) ? '' : styles.voterDim}>
                <Avatar personId={p.id} size="sm" variant={votedIds.has(p.id) ? 'filled' : 'outline'} />
              </span>
            ))}
          </span>
          <span className={styles.statusText}>
            {derived.votesIn}/{state.participants.length} voted
            {!allIn && stillOut.length > 0 ? ` · waiting on ${stillOut.join(' & ')}` : ''}
          </span>
        </div>

        <div className={styles.options}>
          {state.poll.options.map((o) => {
            const lead = derived.leaderId === o.id;
            const pct = state.participants.length > 0 ? (o.votes / state.participants.length) * 100 : 0;
            return (
              <div key={o.id} className={`${styles.option} ${lead ? styles.optionLead : ''}`}>
                <div className={styles.optionTop}>
                  <span className={`${styles.optionName} ${lead ? '' : styles.optionNameMuted}`}>{o.name}</span>
                  <span className={styles.count}>
                    {lead ? <span className={styles.leadTag}>Leading</span> : null}
                    {o.votes} {o.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
                <div className={styles.track}>
                  <div
                    className={`${styles.fill} ${lead ? '' : styles.fillMuted}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
