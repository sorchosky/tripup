/**
 * Screen 10 — Settlement confirmation. The payoff: requests are out. Recaps who owes what (the same
 * transfers from the settle-up solver) and sends Ari back to the trip.
 *
 * Issue #103: this used to read "Everyone's even" as if the debts were already settled — but "Send
 * requests" only *asks* for the money, it doesn't collect it. The copy now says "Request sent" with a
 * subtext that sets the actual expectation (a notification once people pay), and the recap reuses the
 * same debtor-row shape as SettleUpScreen's accordion rows (#100) — avatar, name, amount — just without
 * the chevron/expand affordance or the old "Request" tag (already gone as of #102), since there's
 * nothing left to request from here. The footer drops the `.glass` footer-bar card: "Back to the trip"
 * is a bare floating button (`floatingFooter`, matching the #52/#101 pattern used by SettleUpScreen's
 * CTA), not the boxed footer this screen used to have — which per #52 pairs `floatingFooter` with the
 * `primary-glass` `Button` variant (issue #132 audit: this had drifted to the flat `primary` default).
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Button, Avatar, Eyebrow, Pill } from '../components/ui';
import { CheckCircle } from '../components/icons';
import { participantById } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import styles from './SettlementConfirmationScreen.module.css';

/**
 * Per-payee Pending/Paid status (issue #134).
 *
 * `SETTLEMENT_TIMELINE.redeemedAt` (mock.ts) is a single trip-wide narrative timestamp — it's when
 * the Activity feed (#104) starts narrating that time has passed and every transfer reads as
 * "Redeemed" (issue #157 dropped the payer's name from the pill). It isn't a per-payee signal, so
 * there's no real basis in the mock data to mark one payee's row Paid ahead of another's without
 * inventing data that doesn't exist (CLAUDE.md: don't invent values to make a screen look finished).
 * This screen is reached the instant "Send requests"
 * fires — before any of that narrative time has passed — so every payee genuinely is still Pending at
 * this point in the story.
 *
 * Every row's status is still read off live state (`state.requestsSentAt`) rather than a bare string
 * baked into JSX, so the moment a real per-payee payment confirmation exists, this is the one place
 * that needs to change — the row markup below just renders whatever this returns.
 */
function payeeStatus(requestsSentAt: string | null, _payeeId: string): 'pending' | 'paid' {
  if (!requestsSentAt) return 'pending';
  return 'pending';
}

export default function SettlementConfirmationScreen() {
  const navigate = useNavigate();
  const { state, derived } = useTrip();
  const { transfers } = derived;

  return (
    <Screen
      bleed
      floatingFooter
      footer={
        <Button
          variant="primary-glass"
          onClick={() => navigate('/trip', { state: { paidToast: true } })}
        >
          Back to the trip
        </Button>
      }
    >
      <div className={styles.body}>
        <div className={styles.badge}>
          <CheckCircle size={44} strokeWidth={2.2} />
        </div>
        <h1 className={styles.title}>Request sent</h1>
        <p className={styles.sub}>
          You&apos;ll receive a notification when the trip participants have paid you back.
        </p>

        <div className={styles.sectionHead}>
          <Eyebrow>Consolidated debts</Eyebrow>
        </div>
        <div className={styles.debtors}>
          {transfers.map((t) => {
            const status = payeeStatus(state.requestsSentAt, t.fromId);
            return (
              <div key={t.fromId} className={styles.debtorCard}>
                <span className={styles.debtorWho}>
                  <Avatar personId={t.fromId} size="md" variant="neutral" />
                  <span className={styles.debtorName}>{participantById(t.fromId).name}</span>
                </span>
                <span className={styles.debtorMeta}>
                  <span className={styles.debtorAmount}>{euros(t.amount)}</span>
                  <Pill tone={status === 'paid' ? 'settled' : 'neutral'}>
                    {status === 'paid' ? 'Paid' : 'Pending'}
                  </Pill>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
