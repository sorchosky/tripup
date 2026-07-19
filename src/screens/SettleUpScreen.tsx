/**
 * Screen 9 — Debt consolidation / settle up (step 2 of the "Scan & assign · Settle up" flow).
 *
 * Rebuilt from the "Settle Up (Ari)" wireframe frame (Figma node 29:2170, docs/wireframe-handoff.md
 * §"Settle Up flow"): a payer-perspective hero ("you're owed") plus a per-debtor breakdown, rather than
 * a generic from→to transfer list. The transfers/balances are computed by the real minimum-transfer
 * solver in src/lib/settle.ts from the live balances — not hand-authored — so "you're owed €50.66" is a
 * fact about the data, and every transfer resolves to Ari because Ari fronted the whole receipt.
 */

import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Avatar, Button } from '../components/ui';
import { ArrowLeft, Info } from '../components/icons';
import { participantById, DINNER_RECEIPT } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import type { Assignment } from '../lib/settle';
import styles from './SettleUpScreen.module.css';

/** Which receipt lines a person is currently splitting, as display text (e.g. "Couvert, Arroz de marisco"). */
function itemsFor(personId: string, assignment: Assignment): string {
  return DINNER_RECEIPT.items
    .filter((item) => (assignment[item.id] ?? item.defaultSharedBy).includes(personId))
    .map((item) => item.label)
    .join(', ');
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export default function SettleUpScreen() {
  const navigate = useNavigate();
  const { dispatch, state, derived } = useTrip();
  const { transfers } = derived;

  const count = transfers.length;
  const countWord = count === 1 ? 'One transfer' : count === 2 ? 'Two transfers' : `${count} transfers`;
  const oweTotal = transfers.reduce((sum, t) => sum + t.amount, 0);
  const debtorNames = transfers.map((t) => participantById(t.fromId).name);

  // The settle math has to actually resolve to something before the CTA is live: no transfers means
  // there's nothing to confirm (everyone's already square), and once the trip is settled there's
  // nothing left to re-confirm either. Both are real invariants on derived.transfers/state.settled, not
  // a faked async "computing" window — transfers/balances are synchronous and always resolved.
  const settleDisabled = transfers.length === 0 || state.settled;

  function settle() {
    dispatch({ type: 'SETTLE' });
    navigate('/settle/done');
  }

  return (
    <Screen
      nav={<NavHeader onBack={() => navigate('/split')} leftIcon={<ArrowLeft />} leftAriaLabel="Back to split" />}
      footer={
        <Button onClick={settle} disabled={settleDisabled}>
          Confirm &amp; settle
        </Button>
      }
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

        <div className={styles.heroCard}>
          <Eyebrow>You&apos;re owed</Eyebrow>
          <div className={styles.heroAmountRow}>
            <span className={styles.heroAmount}>{euros(oweTotal)}</span>
            <span className={styles.heroFrom}>from {count === 1 ? '1 person' : `${count} people`}</span>
          </div>
          <p className={styles.heroSub}>Lisbon 2026 · Ramiro Dinner</p>
        </div>

        <div className={styles.sectionHead}>
          <Eyebrow>Consolidated debts</Eyebrow>
        </div>
        <div className={styles.debtors}>
          {transfers.map((t, i) => (
            <div key={i} className={styles.debtorCard}>
              <div className={styles.debtorWho}>
                <Avatar personId={t.fromId} size="md" variant="neutral" />
                <div className={styles.debtorNames}>
                  <span className={styles.debtorName}>{participantById(t.fromId).name}</span>
                  <span className={styles.debtorItems}>{itemsFor(t.fromId, state.assignment)}</span>
                </div>
              </div>
              <div className={styles.debtorRight}>
                <span className={styles.debtorAmount}>{euros(t.amount)}</span>
                <span className={styles.requestTag}>Request</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tipRow}>
          <Info size={16} className={styles.tipIcon} />
          <p className={styles.tipText}>
            Reminders will send a push notification containing itemized shares to {joinNames(debtorNames)}.
          </p>
        </div>
      </div>
    </Screen>
  );
}
