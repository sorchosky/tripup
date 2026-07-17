/**
 * Screen 9 — Debt consolidation / settle up (step 2 of the "Scan & assign · Settle up" flow).
 *
 * The transfers here are computed by the real minimum-transfer solver in src/lib/settle.ts from the
 * live balances — not hand-authored — so the "two transfers close it out" line is a fact about the
 * data, and the balances recap explains where those transfers come from.
 */

import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Avatar, Button } from '../components/ui';
import { ArrowLeft, ArrowRight } from '../components/icons';
import { participantById } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import styles from './SettleUpScreen.module.css';

export default function SettleUpScreen() {
  const navigate = useNavigate();
  const { dispatch, derived } = useTrip();
  const { transfers, balances } = derived;

  const count = transfers.length;
  const countWord = count === 1 ? 'One transfer' : count === 2 ? 'Two transfers' : `${count} transfers`;

  function settle() {
    dispatch({ type: 'SETTLE' });
    navigate('/settle/done');
  }

  return (
    <Screen
      nav={<NavHeader onBack={() => navigate('/split')} leftIcon={<ArrowLeft />} leftAriaLabel="Back to split" />}
      footer={<Button onClick={settle}>Confirm &amp; settle</Button>}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settle up</h1>
          <div className={styles.steps}>
            <span className={styles.stepDone}>Scan &amp; assign</span>
            <span className={styles.stepDot} aria-hidden />
            <span className={styles.stepActive}>Settle up</span>
          </div>
        </div>

        <p className={styles.lede}>
          <span className={styles.ledeStrong}>{countWord} close it out.</span> Ari fronted the dinner, so
          everyone just squares up with them.
        </p>

        <div className={styles.sectionHead}>
          <Eyebrow>The transfers</Eyebrow>
        </div>
        <div className={styles.transfers}>
          {transfers.map((t, i) => (
            <div key={i} className={styles.transfer}>
              <div className={styles.who}>
                <Avatar personId={t.fromId} size="md" variant="neutral" />
                <span className={styles.name}>{participantById(t.fromId).name}</span>
                <ArrowRight size={18} className={styles.arrow} />
                <Avatar personId={t.toId} size="md" variant="filled" />
                <span className={styles.name}>{participantById(t.toId).name}</span>
              </div>
              <span className={styles.amount}>{euros(t.amount)}</span>
            </div>
          ))}
        </div>

        <div className={styles.balances}>
          {balances.map((b) => {
            const cls = b.net > 0 ? styles.owed : b.net < 0 ? styles.owes : styles.even;
            const label =
              b.net > 0 ? `is owed ${euros(b.net)}` : b.net < 0 ? `owes ${euros(-b.net)}` : 'is even';
            return (
              <div key={b.personId} className={styles.balanceRow}>
                <div className={styles.balWho}>
                  <Avatar personId={b.personId} size="sm" variant="neutral" />
                  <span className={styles.balName}>{participantById(b.personId).name}</span>
                </div>
                <span className={`${styles.balNet} ${cls}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
