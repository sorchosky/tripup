/**
 * Screen 10 — Settlement confirmation. The payoff: everyone's even. Recaps the transfers that closed it
 * out (from the same solver output) and sends Ari back to the trip, where the dinner now reads "Paid".
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Button, Avatar } from '../components/ui';
import { CheckCircle, Check } from '../components/icons';
import { participantById } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import styles from './SettlementConfirmationScreen.module.css';

export default function SettlementConfirmationScreen() {
  const navigate = useNavigate();
  const { derived } = useTrip();
  const { transfers } = derived;

  return (
    <Screen
      bleed
      footer={<Button onClick={() => navigate('/trip')}>Back to the trip</Button>}
    >
      <div className={styles.body}>
        <div className={styles.badge}>
          <CheckCircle size={44} strokeWidth={2.2} />
        </div>
        <h1 className={styles.title}>Everyone&apos;s even</h1>
        <p className={styles.sub}>
          {transfers.length === 1 ? 'One transfer' : 'Two transfers'}, done. No running tab, no awkward
          math. Back to the view.
        </p>

        <div className={styles.recap}>
          {transfers.map((t, i) => (
            <div key={i} className={styles.recapRow}>
              <div className={styles.recapWho}>
                <Avatar personId={t.fromId} size="sm" variant="neutral" />
                <span className={styles.recapText}>
                  {participantById(t.fromId).name} paid {participantById(t.toId).name} {euros(t.amount)}
                </span>
              </div>
              <Check size={18} className={styles.recapCheck} />
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
