/**
 * Screen 9 — Debt consolidation / settle up (step 2 of the "Scan & assign · Settle up" flow).
 *
 * Rebuilt from the "Settle Up (Ari)" wireframe frame (Figma node 29:2170, docs/wireframe-handoff.md
 * §"Settle Up flow"): a payer-perspective hero ("you're owed") plus a per-debtor breakdown, rather than
 * a generic from→to transfer list. The transfers/balances are computed by the real minimum-transfer
 * solver in src/lib/settle.ts from the live balances — not hand-authored — so "you're owed €50.66" is a
 * fact about the data, and every transfer resolves to Ari because Ari fronted the whole receipt.
 *
 * The confirm sheet from #40 (a two-step Review/Pay segmented control gating the SETTLE dispatch) is
 * gone as of #102: "Send requests" dispatches SETTLE and navigates straight to /settle/done — no
 * intermediate review/pay step. #103 replaces that destination with a dedicated request-sent
 * confirmation; until then it's the existing SettlementConfirmationScreen.
 *
 * Hero rebuilt around a trip-metadata block + meal-cost donut (issue #99), replacing the earlier
 * photo-hero-with-blurred-glow treatment from issue #61 (ImageGlow + the "You're owed" photo badge —
 * see #94) and the binary SettleRing progress ring from issue #39. The restaurant photo and from/to
 * naming are gone — the per-debtor list below already names names — and in their place: "Ramiro dinner
 * / Lisbon 2026" as plain metadata, and a `MealCostDonut` plotting the full receipt total
 * (`DINNER_RECEIPT.totalCents`) split into Ari's own share vs. what's still owed back, driven off the
 * same `transfers` the debtor list renders (see the `oweTotal` derivation below), so the donut and the
 * figure recompute together whenever the split or an exclusion changes. The footer CTA keeps the
 * full-pill treatment from #61 (a screen-scoped choice — className override — not a change to the
 * global `Button` radius locked by the hi-fi mocks elsewhere).
 *
 * Issue #133 strips the donut's card chrome (background/border/radius/shadow) so it sits directly on
 * the screen's subdued page background — distinct from the `.debtorCard` accordion rows below rather
 * than another card in the same family — drops the "{countWord} close it out." transfer-count lede
 * that used to sit above it, and bumps `--ring-size` 132px → 176px (with the centered label's font
 * scaled up to match, --font-size-title → --font-size-display) now that the donut has the full content
 * column to itself.
 *
 * Consolidated debts are accordion rows (issue #100), replacing the earlier static row + "Request" tag:
 * avatar, name, amount, and a chevron up front; expanding a row reveals the itemized shares — from
 * `personItemShares` in src/lib/settle.ts — that add up to that person's subtotal, so a debtor can see
 * exactly what they're squaring up before #103's request-sent confirmation reuses these same rows.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Avatar, Button } from '../components/ui';
import { MealCostDonut } from '../components/MealCostDonut';
import { ArrowLeft, Info, ChevronDown, ChevronUp } from '../components/icons';
import { participantById, DINNER_RECEIPT } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import { personItemShares, type Assignment, type Transfer } from '../lib/settle';
import styles from './SettleUpScreen.module.css';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** The per-debtor "who pays whom" recap.
 *
 * Each row is an accordion (issue #100): avatar, name, amount, chevron up front; expanding reveals the
 * itemized shares (from `personItemShares`) that add up to that subtotal — a person can see exactly
 * what they're being asked to square up, not just the total. */
function DebtorList({ transfers, assignment }: { transfers: Transfer[]; assignment: Assignment }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(personId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  }

  return (
    <div className={styles.debtors}>
      {transfers.map((t) => {
        const isOpen = expanded.has(t.fromId);
        const panelId = `debtor-items-${t.fromId}`;
        const items = personItemShares(DINNER_RECEIPT, assignment, t.fromId);
        return (
          <div key={t.fromId} className={styles.debtorCard}>
            <button
              type="button"
              className={styles.debtorRow}
              onClick={() => toggle(t.fromId)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className={styles.debtorWho}>
                <Avatar personId={t.fromId} size="md" variant="neutral" />
                <span className={styles.debtorName}>{participantById(t.fromId).name}</span>
              </span>
              <span className={styles.debtorRight}>
                <span className={styles.debtorAmount}>{euros(t.amount)}</span>
                {isOpen ? (
                  <ChevronUp size={18} className={styles.chevron} />
                ) : (
                  <ChevronDown size={18} className={styles.chevron} />
                )}
              </span>
            </button>
            {isOpen ? (
              <div id={panelId} className={styles.debtorItemsList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.debtorItemRow}>
                    <span className={styles.debtorItemLabel}>{item.label}</span>
                    <span className={styles.debtorItemAmount}>{euros(item.amountCents)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function SettleUpScreen() {
  const navigate = useNavigate();
  const { dispatch, state, derived } = useTrip();
  const { transfers } = derived;

  const oweTotal = transfers.reduce((sum, t) => sum + t.amount, 0);
  const debtorNames = transfers.map((t) => participantById(t.fromId).name);

  // The settle math has to actually resolve to something before the CTA is live: no transfers means
  // there's nothing to confirm (everyone's already square), and once the trip is settled there's
  // nothing left to re-confirm either. Both are real invariants on derived.transfers/state.settled, not
  // a faked async "computing" window — transfers/balances are synchronous and always resolved.
  const settleDisabled = transfers.length === 0 || state.settled;

  // #102: no confirm sheet — "Send requests" dispatches SETTLE and navigates straight on. #103 swaps
  // /settle/done for a dedicated request-sent confirmation; until then it's the existing screen there.
  function sendRequests() {
    dispatch({ type: 'SETTLE' });
    navigate('/settle/done');
  }

  return (
    <Screen
      nav={<NavHeader onBack={() => navigate('/split')} leftIcon={<ArrowLeft />} leftAriaLabel="Back to split" />}
      floatingFooter
      footer={
        <Button variant="primary-glass" onClick={sendRequests} disabled={settleDisabled}>
          Send requests
        </Button>
      }
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settle Up</h1>
          <div className={styles.steps}>
            <span className={styles.stepDone}>Scan &amp; assign</span>
            <span className={styles.stepDot} aria-hidden />
            <span className={styles.stepActive}>Settle Up</span>
          </div>
        </div>

        <p className={styles.lede}>Ari fronted the dinner, so everyone just squares up with them.</p>

        <div className={styles.heroCard}>
          <div className={styles.meta}>
            <h2 className={styles.metaTitle}>Ramiro dinner</h2>
            <p className={styles.metaSub}>Lisbon 2026</p>
          </div>
          <MealCostDonut totalCents={DINNER_RECEIPT.totalCents} outstandingCents={oweTotal} />
        </div>

        <div className={styles.sectionHead}>
          <Eyebrow>Consolidated debts</Eyebrow>
        </div>
        <DebtorList transfers={transfers} assignment={state.assignment} />

        <div className={styles.tip}>
          <Info size={16} className={styles.tipIcon} />
          <p className={styles.tipText}>
            Reminders will send a push notification containing itemized shares to {joinNames(debtorNames)}.
          </p>
        </div>
      </div>
    </Screen>
  );
}
