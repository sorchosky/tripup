/**
 * Screen 5 — Poll voting (live). The votes arrive on a timer so the counts, the bars and the leader all
 * update on screen: Ari's vote lands first, then Ren, then Nic. Each vote is a real CAST_VOTE action, so
 * the tally the next screen reveals is whatever actually came in here. Ari can also close early.
 *
 * Issue #104: arriving here fresh off "Send poll to participants" (Create poll) carries a `pollSent`
 * flag in router `location.state` — read once on mount, then cleared via a `replace` navigate so
 * back/forward through history doesn't replay the toast. Issue #105 locks the confirmation copy itself
 * (see `POLL_SENT_TOAST_MESSAGE` below, mirrored in `CONTENT.md` → "Toast copy") using the same `Toast`
 * pattern as `AddParticipantScreen`'s "{Name} has been added to the trip." toast.
 *
 * Issue #106: the back arrow returns to Activity, not Trip Detail — this screen is reached from the
 * send flow (Create poll) rather than from Trip Detail, so Activity is the more natural "where was I"
 * destination. Trip Detail's open-poll banner and Activity's own poll cards still route to `/poll`
 * (open) / `/poll/closed` (closed) unchanged.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Button, Avatar, Toast } from '../components/ui';
import { ArrowLeft } from '../components/icons';
import { useTrip } from '../state/TripContext';
import styles from './PollVotingScreen.module.css';

// Locked wording — CONTENT.md → "Toast copy" (issue #105). Framed as a push-notification confirmation
// per BRAND.md's fact-first, dry voice, matching the existing add-participant toast's register.
const POLL_SENT_TOAST_MESSAGE = 'Poll sent as a push notification.';

/** Who votes for what, and when — the choreography behind the "live" feel. */
const VOTE_SEQUENCE: { voterId: string; optionId: string; delay: number }[] = [
  { voterId: 'ari', optionId: 'cervejaria-ramiro', delay: 450 },
  { voterId: 'ren', optionId: 'cervejaria-ramiro', delay: 1600 },
  { voterId: 'nic', optionId: 'time-out-market', delay: 2800 },
];

export default function PollVotingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch, derived } = useTrip();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timers = VOTE_SEQUENCE.map(({ voterId, optionId, delay }) =>
      setTimeout(() => dispatch({ type: 'CAST_VOTE', optionId, voterId }), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [dispatch]);

  // On-mount toast trigger (issue #104): only fires when arriving fresh off a send, and clears the
  // flag immediately so navigating back to this screen later doesn't replay it.
  useEffect(() => {
    const navState = location.state as { pollSent?: boolean } | null;
    if (navState?.pollSent) {
      setToastMessage(POLL_SENT_TOAST_MESSAGE);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const votedIds = new Set(state.poll.options.flatMap((o) => o.votedBy));
  const allIn = derived.votesIn >= state.participants.length;
  const stillOut = state.participants.filter((p) => !votedIds.has(p.id)).map((p) => p.name);

  function close() {
    dispatch({ type: 'CLOSE_POLL' });
    navigate('/poll/closed');
  }

  return (
    <>
      <Screen
        nav={<NavHeader onBack={() => navigate('/activity')} leftIcon={<ArrowLeft />} leftAriaLabel="Back to activity" />}
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
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  );
}
