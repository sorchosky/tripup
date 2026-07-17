/**
 * Screens 7 + 8 (fused) — Scan & assign. HIGH-FIDELITY port of `receipt-capture-itemize` (29:2783).
 *
 * The hi-fi mock draws log-expense, itemization and per-item exclusion as one "Scan & assign" step of a
 * two-step ("Scan & assign · Settle up") flow, so it's built as one screen. Tapping a participant chip
 * on a line toggles them on/off that item (filled navy = assigned, outlined = excluded — the exclusion
 * affordance from DESIGN.md), and the footer subtotals recompute live from the real split logic.
 */

import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Avatar, Button } from '../components/ui';
import { ArrowLeft, X, AlertTriangle } from '../components/icons';
import { DINNER_RECEIPT } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import styles from './SplitScreen.module.css';

export default function SplitScreen() {
  const navigate = useNavigate();
  const { state, dispatch, derived } = useTrip();

  return (
    <Screen
      bleed
      nav={
        <NavHeader
          onBack={() => navigate(-1)}
          leftIcon={<ArrowLeft />}
          leftAriaLabel="Back"
          rightIcon={<X size={20} />}
          rightAriaLabel="Close"
          onRight={() => navigate('/trip')}
        />
      }
      footer={
        <>
          <div className={styles.subtotals}>
            {state.participants.map((p, i) => (
              <div key={p.id} className={styles.subtotal}>
                <Avatar personId={p.id} size="md" variant={i === 0 ? 'filled' : 'neutral'} />
                <span className={styles.subAmount}>{euros(derived.shares[p.id] ?? 0)}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => navigate('/settle')}>Review split</Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.header}>
          <h1 className={styles.title}>Split the bill</h1>
          <div className={styles.steps}>
            <span className={styles.stepActive}>Scan &amp; assign</span>
            <span className={styles.stepDot} aria-hidden />
            <span className={styles.stepInactive}>Settle up</span>
          </div>
        </div>

        <section className={styles.section}>
          <Eyebrow>Captured receipt</Eyebrow>
          <div className={styles.receiptCard}>
            <div className={styles.thumb} aria-hidden>
              <span className={`${styles.thumbLine} ${styles.mid}`} />
              <span className={styles.thumbLine} />
              <span className={`${styles.thumbLine} ${styles.short}`} />
              <span className={styles.thumbLine} />
              <span className={`${styles.thumbLine} ${styles.mid}`} />
              <span className={styles.thumbTotal} />
            </div>
            <div className={styles.receiptMeta}>
              <span className={styles.merchant}>{DINNER_RECEIPT.merchant}</span>
              <span className={styles.receiptSub}>{DINNER_RECEIPT.locationDate}</span>
              <span className={styles.receiptTotal}>
                Total {euros(DINNER_RECEIPT.totalCents)} · {DINNER_RECEIPT.items.length} items
              </span>
            </div>
            <button type="button" className={styles.retake}>
              Retake
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <Eyebrow>Items</Eyebrow>
          <div className={styles.items}>
            {DINNER_RECEIPT.items.map((item) => {
              const assigned = state.assignment[item.id] ?? [];
              return (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemTop}>
                    <div className={styles.itemName}>
                      <span className={styles.qty}>×{item.qty}</span>
                      <span className={styles.name}>{item.label}</span>
                    </div>
                    <span className={styles.price}>{euros(item.amountCents)}</span>
                  </div>

                  {item.needsReview ? (
                    <div className={styles.warning}>
                      <AlertTriangle size={16} />
                      <span>This price needs a second look, tap to fix</span>
                    </div>
                  ) : null}

                  <div className={styles.assignRow}>
                    <span className={styles.assignLabel}>Assigned to</span>
                    <div className={styles.chips}>
                      {state.participants.map((p) => {
                        const isOn = assigned.includes(p.id);
                        return (
                          <Avatar
                            key={p.id}
                            personId={p.id}
                            size="lg"
                            variant={isOn ? 'filled' : 'outline'}
                            onClick={() => dispatch({ type: 'TOGGLE_ASSIGNEE', itemId: item.id, personId: p.id })}
                            ariaPressed={isOn}
                            ariaLabel={`${p.name} — ${isOn ? 'splitting' : 'excluded from'} ${item.label}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <button type="button" className={styles.addItem}>
              +&nbsp;&nbsp;Add item manually
            </button>
          </div>
        </section>
      </div>
    </Screen>
  );
}
