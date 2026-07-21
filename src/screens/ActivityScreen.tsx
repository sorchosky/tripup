/**
 * Screen 11 — Activity feed (issue #57). The Activity tab's real destination: a computed digest of the
 * live trip state — the open poll and who's responded, the decided result, and the settle-up lifecycle
 * — so the poll → split → settle journey has one place that ties it together instead of living only as
 * a banner on Trip Detail. No persisted event log; every cell reads straight off `TripContext`/
 * `derived`, same source every other screen uses. New surface beyond the ≤10-screen inventory — see
 * DESIGN.md.
 *
 * Issue #104 reworks the feed's eyebrows and the settle-up half of the timeline:
 *   - Every cell's eyebrow is now a date/time stamp ("Jun 17 · 6:32 PM"), not a static section label
 *     ("Active poll" / "Poll decided" / "Settle up" / "Settled") — see `formatFeedEyebrow` in
 *     `src/lib/dates.ts`. The open-poll section has no fixed clock reading in the mock data (votes
 *     aren't individually timestamped), so its eyebrow is date-only rather than a fabricated time.
 *   - The old "Settle up" (outstanding debtor cards) and "Settled" ("Everyone's even") sections are
 *     gone. In their place: a single chronological tail — poll winner, then "Requests sent" once
 *     `SETTLE` fires (`state.requestsSentAt`), then one payment-received cell per transfer, all
 *     "redeemed by Ari" — matching the request being sent and the money landing back with whoever
 *     fronted the tab. All three read off live state/derived data (`state.poll`, `state.requestsSentAt`,
 *     `derived.transfers`); the clock readings on the settle cells are the fixed narrative timestamps in
 *     `SETTLEMENT_TIMELINE` (mock.ts), same treatment as the poll's `closedAt`.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Eyebrow, Pill, Avatar, TabBar } from '../components/ui';
import { participantById, SETTLEMENT_TIMELINE } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import { formatFeedEyebrow, formatFeedEyebrowDateOnly, NARRATIVE_TODAY } from '../lib/dates';
import styles from './ActivityScreen.module.css';

const TODAY_ISO = NARRATIVE_TODAY.toISOString().slice(0, 10);

export default function ActivityScreen() {
  const navigate = useNavigate();
  const { state, dispatch, derived } = useTrip();

  // Opening the Activity tab is what the #105 badge is warning about — clear it the moment this
  // screen mounts, same instant the TabBar (rendered here too) stops showing the dot.
  useEffect(() => {
    dispatch({ type: 'VIEW_ACTIVITY' });
  }, [dispatch]);

  const votesIn = state.poll.options.reduce((n, o) => n + o.votes, 0);
  const votedRows = state.poll.options.flatMap((o) => o.votedBy.map((id) => ({ id, optionName: o.name })));
  const ranked = [...state.poll.options].sort((a, b) => b.votes - a.votes);
  const [winner, runnerUp] = ranked;

  // Genuine empty state (issue #57): before the first vote, `poll.status` is 'none' — neither the
  // open-poll nor the decided-poll cell renders — and there's no settle activity yet either, so
  // nothing else has anything to show. Reachable (a user can tap Activity right after opening the
  // app), so it needs real in-voice copy rather than a blank screen below the title.
  const showOpenPoll = state.poll.status === 'open';
  const showDecidedPoll = state.poll.status === 'closed' && !!winner;
  const showRequestsSent = !!state.requestsSentAt;
  const showPayments = showRequestsSent && derived.transfers.length > 0;
  const hasContent = showOpenPoll || showDecidedPoll || showRequestsSent;

  return (
    <Screen tabBar={<TabBar />}>
      <div className={styles.body}>
        <h1 className={styles.title}>Activity</h1>

        {showOpenPoll ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>{formatFeedEyebrowDateOnly(TODAY_ISO)}</Eyebrow>
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
              <Eyebrow>{formatFeedEyebrow(TODAY_ISO, state.poll.closedAt)}</Eyebrow>
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

        {showRequestsSent ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>{formatFeedEyebrow(TODAY_ISO, SETTLEMENT_TIMELINE.requestsSentAt)}</Eyebrow>
            </div>
            <div className={styles.settledCard}>
              <span className={styles.settledText}>Requests sent.</span>
              <Pill tone="neutral">Awaiting payment</Pill>
            </div>
          </section>
        ) : null}

        {showPayments ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Eyebrow>{formatFeedEyebrow(TODAY_ISO, SETTLEMENT_TIMELINE.redeemedAt)}</Eyebrow>
            </div>
            <div className={styles.debtors}>
              {derived.transfers.map((t) => (
                <div key={t.fromId} className={styles.debtorCard}>
                  <div className={styles.debtorWho}>
                    <Avatar personId={t.fromId} size="sm" variant="neutral" />
                    <span className={styles.debtorName}>
                      {participantById(t.fromId).name} paid {euros(t.amount)}
                    </span>
                  </div>
                  <Pill tone="settled">Redeemed by Ari</Pill>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!hasContent ? (
          <>
            <div className={styles.empty}>
              <span className={styles.emptyStrong}>Nothing moving yet.</span> Vote in a poll or log an
              expense, and it&apos;ll show up here.
            </div>
            {/* Feed-in-waiting: muted skeleton cells, not fabricated activity — see CLAUDE.md's
                placeholder rule and issue #106. */}
            <div className={styles.placeholders} aria-hidden>
              <div className={styles.placeholderCard}>
                <span className={`${styles.placeholderLine} ${styles.placeholderEyebrow}`} />
                <span className={`${styles.placeholderLine} ${styles.placeholderTitle}`} />
              </div>
              <div className={styles.placeholderCard}>
                <span className={`${styles.placeholderLine} ${styles.placeholderEyebrow}`} />
                <span className={`${styles.placeholderLine} ${styles.placeholderTitleShort}`} />
              </div>
              <div className={styles.placeholderCard}>
                <span className={`${styles.placeholderLine} ${styles.placeholderEyebrow}`} />
                <span className={`${styles.placeholderLine} ${styles.placeholderTitle}`} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Screen>
  );
}
