/**
 * Screen 9 — Debt consolidation / settle up (step 2 of the "Scan & assign · Settle up" flow).
 *
 * Rebuilt from the "Settle Up (Ari)" wireframe frame (Figma node 29:2170, docs/wireframe-handoff.md
 * §"Settle Up flow"): a payer-perspective hero ("you're owed") plus a per-debtor breakdown, rather than
 * a generic from→to transfer list. The transfers/balances are computed by the real minimum-transfer
 * solver in src/lib/settle.ts from the live balances — not hand-authored — so "you're owed €50.66" is a
 * fact about the data, and every transfer resolves to Ari because Ari fronted the whole receipt.
 *
 * "Confirm & settle" (#40) opens a partial-height confirm sheet instead of settling immediately — a
 * two-step Review/Pay segmented control inside it. Advancing to Pay and confirming is what actually
 * dispatches SETTLE; /settle/done stays the post-confirm destination (chosen over an inline sheet
 * success state — see PR).
 */

import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Avatar, Button, SegmentedControl } from '../components/ui';
import { BottomSheet } from '../components/BottomSheet';
import { ArrowLeft, Info, Check } from '../components/icons';
import { participantById, DINNER_RECEIPT } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import type { Assignment, Transfer } from '../lib/settle';
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

/** The per-debtor "who pays whom" recap — the exact same rows on the main screen and the confirm
 * sheet's Review step, so the numbers a person confirms are the numbers they already saw (#40). */
function DebtorList({ transfers, assignment }: { transfers: Transfer[]; assignment: Assignment }) {
  return (
    <div className={styles.debtors}>
      {transfers.map((t, i) => (
        <div key={i} className={styles.debtorCard}>
          <div className={styles.debtorWho}>
            <Avatar personId={t.fromId} size="md" variant="neutral" />
            <div className={styles.debtorNames}>
              <span className={styles.debtorName}>{participantById(t.fromId).name}</span>
              <span className={styles.debtorItems}>{itemsFor(t.fromId, assignment)}</span>
            </div>
          </div>
          <div className={styles.debtorRight}>
            <span className={styles.debtorAmount}>{euros(t.amount)}</span>
            <span className={styles.requestTag}>Request</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type ConfirmStep = 'review' | 'pay';

export default function SettleUpScreen() {
  const navigate = useNavigate();
  const { dispatch, state, derived } = useTrip();
  const { transfers } = derived;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState<ConfirmStep>('review');

  const count = transfers.length;
  const countWord = count === 1 ? 'One transfer' : count === 2 ? 'Two transfers' : `${count} transfers`;
  const oweTotal = transfers.reduce((sum, t) => sum + t.amount, 0);
  const debtorNames = transfers.map((t) => participantById(t.fromId).name);

  // The settle math has to actually resolve to something before the CTA is live: no transfers means
  // there's nothing to confirm (everyone's already square), and once the trip is settled there's
  // nothing left to re-confirm either. Both are real invariants on derived.transfers/state.settled, not
  // a faked async "computing" window — transfers/balances are synchronous and always resolved.
  const settleDisabled = transfers.length === 0 || state.settled;

  function openConfirm() {
    setStep('review');
    setConfirmOpen(true);
  }

  function confirmPay() {
    dispatch({ type: 'SETTLE' });
    // The sheet unmounts along with the rest of this screen on navigation, so no separate closing
    // animation is needed on top of the route change.
    navigate('/settle/done');
  }

  return (
    <Fragment>
      <Screen
        nav={<NavHeader onBack={() => navigate('/split')} leftIcon={<ArrowLeft />} leftAriaLabel="Back to split" />}
        footer={
          <Button onClick={openConfirm} disabled={settleDisabled}>
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
            <span className={styles.ledeStrong}>{countWord} close it out.</span> Ari fronted the dinner,
            so everyone just squares up with them.
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
          <DebtorList transfers={transfers} assignment={state.assignment} />

          <div className={styles.tipRow}>
            <Info size={16} className={styles.tipIcon} />
            <p className={styles.tipText}>
              Reminders will send a push notification containing itemized shares to {joinNames(debtorNames)}.
            </p>
          </div>
        </div>
      </Screen>

      {confirmOpen ? (
        <BottomSheet
          title="Settle up"
          variant="partial"
          onClose={() => setConfirmOpen(false)}
          footer={
            <Button onClick={step === 'review' ? () => setStep('pay') : confirmPay}>
              {step === 'review' ? 'Continue to pay' : 'Confirm payment'}
            </Button>
          }
        >
          <SegmentedControl
            ariaLabel="Settle up step"
            value={step}
            onChange={setStep}
            options={[
              { key: 'review', label: 'Review' },
              { key: 'pay', label: 'Pay' },
            ]}
          />

          {step === 'review' ? (
            <div className={styles.sheetSection}>
              <p className={styles.sheetLede}>
                {countWord} close it out — {euros(oweTotal)} total, from {joinNames(debtorNames)}.
              </p>
              <DebtorList transfers={transfers} assignment={state.assignment} />
            </div>
          ) : (
            <div className={styles.sheetSection}>
              <Eyebrow>Pay with</Eyebrow>
              <div className={styles.paymentMethod}>
                <span className={styles.paymentMethodLabel}>Apple Pay</span>
                <Check size={16} className={styles.paymentMethodCheck} />
              </div>
              <p className={styles.sheetLede}>
                Everyone&apos;s even, everyone&apos;s good. Confirm and Ari&apos;s tab closes for good.
              </p>
            </div>
          )}
        </BottomSheet>
      ) : null}
    </Fragment>
  );
}
