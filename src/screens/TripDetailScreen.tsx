/**
 * Screen 2 — Trip detail / group view. The hub Ari returns to between steps: the group, the itinerary,
 * and the money. Chrome is the shared liquid-glass tab bar (Trips active) plus a right-side glass FAB
 * for the two quick actions that used to live behind the single evolving footer CTA — starting a poll
 * and adding a stop to the itinerary. The rest of the linear journey (poll → split → settle) is reached
 * from the itinerary itself: an open poll surfaces as a tappable banner, a pending expense as a
 * tappable itinerary row.
 */

import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Pill, AvatarGroup, TabBar, Fab, type MenuItemDef } from '../components/ui';
import { ArrowLeft, Ellipsis, Vote, CalendarPlus } from '../components/icons';
import { TRIP, COFFEE_STOP_ITINERARY_ITEM } from '../data/mock';
import { useTrip } from '../state/TripContext';
import type { ItineraryStatus } from '../data/mock';
import { formatDateRange } from '../lib/dates';
import styles from './TripDetailScreen.module.css';

function statusPill(status: ItineraryStatus) {
  if (status === 'paid') return <Pill tone="settled">Paid</Pill>;
  if (status === 'pending') return <Pill tone="owed">Pending</Pill>;
  return null;
}

export default function TripDetailScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();

  const fabItems: MenuItemDef[] = [
    {
      key: 'create-poll',
      label: 'Create a poll',
      icon: <Vote size={18} />,
      onSelect: () => navigate('/poll/new'),
    },
    {
      key: 'add-itinerary',
      label: 'Add to itinerary',
      icon: <CalendarPlus size={18} />,
      onSelect: () => dispatch({ type: 'ADD_ITINERARY_ITEM', item: COFFEE_STOP_ITINERARY_ITEM }),
    },
  ];

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
      tabBar={
        <div className={styles.chrome}>
          <div className={styles.tabBarFlex}>
            <TabBar />
          </div>
          <Fab items={fabItems} ariaLabel="Add to trip" />
        </div>
      }
    >
      <div className={styles.overview}>
        <h1 className={styles.title}>{TRIP.name}</h1>
        <p className={styles.subtitle}>
          {TRIP.destination} · {formatDateRange(TRIP.dates.start, TRIP.dates.end)}
        </p>

        <div className={styles.memberRow}>
          <AvatarGroup personIds={state.participants.map((p) => p.id)} size="md" />
        </div>
      </div>

      {state.poll.status === 'open' ? (
        <button type="button" className={styles.pollBanner} onClick={() => navigate('/poll')}>
          <span className={styles.pollBannerText}>{state.poll.question}</span>
          <Pill tone="neutral">Poll open</Pill>
        </button>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <Eyebrow>Itinerary</Eyebrow>
        </div>
        <div className={styles.timeline}>
          {state.itinerary.map((item) => {
            const clickable = item.status === 'pending';
            const body = (
              <>
                <span className={`${styles.time} ${item.time ? '' : styles.timeEmpty}`}>{item.time ?? '·'}</span>
                <div className={styles.eventBody}>
                  <div className={styles.eventTitleRow}>
                    <span className={styles.eventTitle}>{item.title}</span>
                    {statusPill(item.status)}
                  </div>
                  <p className={styles.eventSub}>{item.subtitle}</p>
                </div>
              </>
            );
            return clickable ? (
              <button
                key={item.id}
                type="button"
                className={`${styles.event} ${styles.eventButton}`}
                onClick={() => navigate('/split')}
              >
                {body}
              </button>
            ) : (
              <div key={item.id} className={styles.event}>
                {body}
              </div>
            );
          })}
        </div>
      </section>
    </Screen>
  );
}
