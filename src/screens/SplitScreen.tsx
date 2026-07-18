/**
 * Screens 7 + 8 (fused) — Scan & assign. HIGH-FIDELITY port of `receipt-capture-itemize` (29:2783).
 *
 * The hi-fi mock draws log-expense, itemization and per-item exclusion as one "Scan & assign" step of a
 * two-step ("Scan & assign · Settle up") flow, so it's built as one screen. Tapping a participant chip
 * on a line toggles them on/off that item (filled navy = assigned, outlined = excluded — the exclusion
 * affordance from DESIGN.md), and the footer subtotals recompute live from the real split logic.
 *
 * Entry point is an empty state, not the populated list directly — receipt-scan is mocked (scope
 * contract), so "capture" walks through a fake camera view rather than a real OCR pipeline, landing on
 * the populated screen via the loading/skeleton state the wireframe annotations anticipate (29:2391).
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Avatar, Button } from '../components/ui';
import { ArrowLeft, Ellipsis, Camera, X } from '../components/icons';
import { DINNER_RECEIPT } from '../data/mock';
import { useTrip } from '../state/TripContext';
import { euros } from '../lib/format';
import styles from './SplitScreen.module.css';

type Stage = 'empty' | 'capturing' | 'loading' | 'populated';

/** How long the mocked "OCR" skeleton stays up before the canned scan result populates the screen. */
const SCAN_DELAY_MS = 900;

export default function SplitScreen() {
  const navigate = useNavigate();
  const { state, dispatch, derived } = useTrip();
  const [stage, setStage] = useState<Stage>('empty');
  const [addItemOpen, setAddItemOpen] = useState(false);

  useEffect(() => {
    if (stage !== 'loading') return undefined;
    const timer = setTimeout(() => setStage('populated'), SCAN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [stage]);

  if (stage === 'capturing') {
    return (
      <Screen bleed>
        <div className={styles.capture}>
          <button
            type="button"
            className={styles.captureCancel}
            aria-label="Cancel capture"
            onClick={() => setStage('empty')}
          >
            <X size={20} />
          </button>
          <div className={styles.captureViewfinder} aria-hidden>
            <Camera size={32} />
          </div>
          <p className={styles.captureHint}>Line up the receipt inside the frame.</p>
          <button
            type="button"
            className={styles.shutter}
            aria-label="Capture receipt photo"
            onClick={() => setStage('loading')}
          >
            <span className={styles.shutterRing} />
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      bleed
      nav={
        <NavHeader
          onBack={() => navigate(-1)}
          leftIcon={<ArrowLeft />}
          leftAriaLabel="Back"
          rightIcon={<Ellipsis />}
          rightAriaLabel="Split options"
        />
      }
      floatingFooter={stage === 'populated'}
      footer={
        stage === 'populated' ? (
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
        ) : undefined
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

        {stage === 'empty' ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>
              <Camera size={26} />
            </div>
            <p className={styles.emptyTitle}>No receipt yet.</p>
            <p className={styles.emptySub}>Snap the tab and we&apos;ll do the math from there.</p>
            <Button className={styles.emptyButton} onClick={() => setStage('capturing')}>
              <Camera size={18} />
              Capture receipt
            </Button>
          </div>
        ) : null}

        {stage === 'loading' ? (
          <section className={styles.section}>
            <Eyebrow>Captured receipt</Eyebrow>
            <div className={`${styles.receiptCard} ${styles.receiptSkeleton}`} aria-hidden>
              <span className={styles.skelThumb} />
              <div className={styles.skelLines}>
                <span className={styles.skelLine} style={{ width: '55%' }} />
                <span className={styles.skelLine} style={{ width: '38%' }} />
                <span className={styles.skelLine} style={{ width: '46%' }} />
              </div>
            </div>
            <p className={styles.loadingCaption} role="status">
              Reading the receipt.
            </p>
          </section>
        ) : null}

        {stage === 'populated' ? (
          <>
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
                <button type="button" className={styles.retake} onClick={() => setStage('capturing')}>
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

                <button type="button" className={styles.addItem} onClick={() => setAddItemOpen(true)}>
                  +&nbsp;&nbsp;Add item manually
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>

      {addItemOpen ? <AddItemSheet onClose={() => setAddItemOpen(false)} /> : null}
    </Screen>
  );
}

/**
 * "Add item manually" as a bottom sheet over the item list. Submitting mocks the same "canned result"
 * philosophy as the receipt scan itself — real manual-entry persistence (and the itinerary/settle-up
 * math it would feed) is out of scope for this ticket; the sheet just replaces the old inline button.
 */
function AddItemSheet({ onClose }: { onClose: () => void }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.sheetOverlay}>
      <button type="button" className={styles.sheetScrim} aria-label="Close" onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Add an item">
        <span className={styles.sheetGrabber} aria-hidden />
        <h2 className={styles.sheetTitle}>Add an item</h2>
        <label className={styles.sheetField}>
          <span className={styles.sheetFieldLabel}>Item</span>
          <input
            className={styles.sheetInput}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Extra round of pastéis"
            autoComplete="off"
          />
        </label>
        <label className={styles.sheetField}>
          <span className={styles.sheetFieldLabel}>Price</span>
          <input
            className={styles.sheetInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="€0.00"
            inputMode="decimal"
          />
        </label>
        <Button onClick={onClose}>Add item</Button>
      </div>
    </div>
  );
}
