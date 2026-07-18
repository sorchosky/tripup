/**
 * Screen 2 — Trip detail / group view. The hub Ari returns to between steps: the group, the itinerary,
 * and one contextual call-to-action that always points at the next thing to do. That single evolving
 * CTA is what lets a cold tester walk the whole flow without narration.
 */

import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Pill, AvatarGroup, Button } from '../components/ui';
import { ArrowLeft, Ellipsis, Plus } from '../components/icons';
import { TRIP } from '../data/mock';
import { useTrip } from '../state/TripContext';
import type { ItineraryStatus } from '../data/mock';
import { formatDateRange } from '../lib/dates';
import styles from './TripDetailScreen.module.css';

function statusPill(status: ItineraryStatus) {
  if (status === 'paid') return <Pill tone="settled">Paid</Pill>;
  if (status === 'pending') return <Pill tone="owed">Pending</Pill>;
  return null;
}

/** The one CTA that moves the story forward, chosen from where the trip currently is. */
function nextStep(args: {
  hasRen: boolean;
  pollStatus: string;
  settled: boolean;
}): { label: string; to: string; disabled?: boolean } {
  if (!args.hasRen) return { label: 'Add Ren to the trip', to: '/trip/add' };
  if (args.pollStatus === 'none') return { label: 'Start a poll — where to eat?', to: '/poll/new' };
  if (args.pollStatus === 'open') return { label: 'See the votes come in', to: '/poll' };
  if (!args.settled) return { label: 'Split the bill', to: '/split' };
  return { label: "Everyone's square", to: '/', disabled: true };
}

export default function TripDetailScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();

  const hasRen = state.participants.some((p) => p.id === 'ren');
  const step = nextStep({ hasRen, pollStatus: state.poll.status, settled: state.settled });

  return (
    <Screen
      nav={
        <NavHeader
          onBack={() => navigate('/')}
          leftIcon={<ArrowLeft />}
          leftAriaLabel="Back to trips"
          rightIcon={<Ellipsis />}
          rightAriaLabel="Trip options"
        />
      }
      footer={
        <Button onClick={() => !step.disabled && navigate(step.to)} disabled={step.disabled}>
          {step.label}
        </Button>
      }
    >
      <div className={styles.overview}>
        <h1 className={styles.title}>{TRIP.name}</h1>
        <p className={styles.subtitle}>
          Lisbon · the house in São Bento · {formatDateRange(TRIP.dates.start, TRIP.dates.end)}
        </p>

        <div className={styles.memberRow}>
          <AvatarGroup personIds={state.participants.map((p) => p.id)} size="md" />
          {!hasRen ? (
            <button type="button" className={styles.addBtn} onClick={() => navigate('/trip/add')}>
              <Plus size={14} />
              Add
            </button>
          ) : null}
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <Eyebrow>Itinerary</Eyebrow>
        </div>
        <div className={styles.timeline}>
          {state.itinerary.map((item) => (
            <div key={item.id} className={styles.event}>
              <span className={`${styles.time} ${item.time ? '' : styles.timeEmpty}`}>{item.time ?? '·'}</span>
              <div className={styles.eventBody}>
                <div className={styles.eventTitleRow}>
                  <span className={styles.eventTitle}>{item.title}</span>
                  {statusPill(item.status)}
                </div>
                <p className={styles.eventSub}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Screen>
  );
}
