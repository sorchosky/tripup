/**
 * Screen 11 — Activity feed (issue #57). The Activity tab's real destination: a computed digest of the
 * live trip state — the open poll and who's responded, the decided result, and who still owes what — so
 * the poll → split → settle journey has one place that ties it together instead of living only as a
 * banner on Trip Detail. No persisted event log; every card reads straight off `TripContext`/`derived`,
 * same source every other screen uses. New surface beyond the ≤10-screen inventory — see DESIGN.md.
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Eyebrow, Pill, Avatar, TabBar } from '../components/ui';
import { participantById } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import styles from './ActivityScreen.module.css';

export default function ActivityScreen() {
  const navigate = useNavigate();
  const { state, derived } = useTrip();

  const votesIn = state.poll.options.reduce((n, o) => n + o.votes, 0);
  const votedRows = state.poll.options.flatMap((o) => o.votedBy.map((id) => ({ id, optionName: o.name })));
  const ranked = [...state.poll.options].sort((a, b) => b.votes - a.votes);
  const [winner, runnerUp] = ranked;

  const dinnerLogged = state.itinerary.some((i) => i.id === 'dinner');
  const showSettleUp = dinnerLogged && !state.settled && derived.transfers.length > 0;
  const showSettled = dinnerLogged && state.settled;
  // Grammar has to hold at 1 transfer too, not just the 2-transfer case the copy was drafted against
  // (CONTENT.md) — the actual mock split resolves to a single transfer.
  const transferCount = derived.transfers.length;
  const settleUpSummary =
    transferCount === 1
      ? 'One transfer closes it out.'
      : transferCount === 2
        ? 'Two transfers close it out.'
        : `${transferCount} transfers close it out.`;

  // Genuine empty state (issue #57): before the first vote, `poll.status` is 'none' — neither the
  // open-poll nor the decided-poll section renders — and there's no expense yet either, so nothing
  // else has anything to show. Reachable (a user can tap Activity right after opening the app), so it
  // needs real in-voice copy rather than a blank screen below the title.
  const showOpenPoll = state.poll.status === 'open';
  const showDecidedPoll = state.poll.status === 'closed' && !!winner;
  const hasContent = showOpenPoll || showDecidedPoll || showSettleUp || showSettled;

  return (
    <Screen tabBar={<TabBar />}>
      <div className={styles.body}>
        <h1 className={styles.title}>Activity</h1>

        {showOpenPoll ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>Active poll</Eyebrow>
            </div>
            <button type="button" className={styles.pollCard} onClick={() => navigate('/poll')}>
              <div className={styles.pollCardHead}>
                <span className={styles.pollQuestion}>{state.poll.question}</span>
                <Pill tone="neutral">Poll open</Pill>
              </div>
              <p className={styles.sectionSub}>
                {votesIn} of {state.participants.length} in.
              </p>
            </button>
            {votedRows.length > 0 ? (
              <div className={styles.responses}>
                {votedRows.map(({ id, optionName }) => (
                  <div key={id} className={styles.responseRow}>
                    <Avatar personId={id} size="sm" variant="neutral" />
                    <span className={styles.responseText}>
                      {participantById(id).name} voted <span className={styles.responseOption}>{optionName}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {showDecidedPoll ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>Poll decided</Eyebrow>
            </div>
            <button type="button" className={styles.pollCard} onClick={() => navigate('/poll/closed')}>
              <div className={styles.pollCardHead}>
                <span className={styles.pollQuestion}>
                  {winner.name} wins, {winner.votes} to {runnerUp?.votes ?? 0}.
                </span>
                <Pill tone="settled">Poll closed</Pill>
              </div>
            </button>
          </section>
        ) : null}

        {showSettleUp ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>Settle up</Eyebrow>
            </div>
            <div className={styles.debtors}>
              {derived.transfers.map((t, i) => (
                <button key={i} type="button" className={styles.debtorCard} onClick={() => navigate('/settle')}>
                  <div className={styles.debtorWho}>
                    <Avatar personId={t.fromId} size="sm" variant="neutral" />
                    <span className={styles.debtorName}>
                      {participantById(t.fromId).name} owes {euros(t.amount)}
                    </span>
                  </div>
                  <span className={styles.requestTag}>Request</span>
                </button>
              ))}
            </div>
            <p className={styles.sectionSub}>{settleUpSummary}</p>
          </section>
        ) : null}

        {showSettled ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>Settled</Eyebrow>
            </div>
            <div className={styles.settledCard}>
              <span className={styles.settledText}>Everyone&apos;s even.</span>
              <Pill tone="settled">Settled up</Pill>
            </div>
          </section>
        ) : null}

        {!hasContent ? (
          <div className={styles.empty}>
            <span className={styles.emptyStrong}>Nothing moving yet.</span> Vote in a poll or log an
            expense, and it&apos;ll show up here.
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
