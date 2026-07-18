/**
 * Screen 2 — Trip detail / group view. The hub Ari returns to between steps: the group, the itinerary,
 * and the money. Chrome is the shared liquid-glass tab bar (Trips active) plus a right-side glass FAB
 * for the two quick actions that used to live behind the single evolving footer CTA — starting a poll
 * and adding a stop to the itinerary. The rest of the linear journey (poll → split → settle) is reached
 * from the itinerary itself: an open poll surfaces as a tappable banner, a pending expense as a
 * tappable itinerary row.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Pill, AvatarGroup, TabBar, Fab, type MenuItemDef } from '../components/ui';
import { ArrowLeft, Ellipsis, Vote, CalendarPlus } from '../components/icons';
import { TRIP, COFFEE_STOP_ITINERARY_ITEM } from '../data/mock';
import { useTrip } from '../state/TripContext';
import type { ItineraryStatus } from '../data/mock';
import { formatDateRange, formatItineraryDay, NARRATIVE_NOW } from '../lib/dates';
import { groupItineraryByDay, findAnchorId, isUpcoming } from '../lib/itinerary';
import styles from './TripDetailScreen.module.css';

function statusPill(status: ItineraryStatus) {
  if (status === 'paid') return <Pill tone="settled">Paid</Pill>;
  if (status === 'pending') return <Pill tone="owed">Pending</Pill>;
  return null;
}

export default function TripDetailScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const dayGroups = useMemo(() => groupItineraryByDay(state.itinerary), [state.itinerary]);
  const anchorId = useMemo(() => findAnchorId(state.itinerary, NARRATIVE_NOW), [state.itinerary]);
  const flatOrder = useMemo(() => dayGroups.flatMap((group) => group.items.map((item) => item.id)), [dayGroups]);
  const anchorIndex = anchorId ? flatOrder.indexOf(anchorId) : -1;

  // Scroll to "now" once on load — deliberately not re-run on itinerary changes, so closing the poll
  // or settling up while already on this screen doesn't yank the user's scroll position.
  useEffect(() => {
    if (anchorId) itemRefs.current.get(anchorId)?.scrollIntoView({ block: 'center' });
  }, []);

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

      {dayGroups.map((group) => (
        <section key={group.day} className={styles.section}>
          <div className={styles.sectionHead}>
            <Eyebrow>{formatItineraryDay(group.day)}</Eyebrow>
          </div>
          <div className={styles.timeline}>
            {group.items.map((item) => {
              const clickable = item.status === 'pending';
              const isAnchor = item.id === anchorId;
              const isPast = anchorIndex >= 0 && flatOrder.indexOf(item.id) < anchorIndex;
              const eventClassName = [
                styles.event,
                clickable ? styles.eventButton : '',
                isAnchor ? styles.eventAnchor : '',
                isPast ? styles.eventPast : '',
              ]
                .filter(Boolean)
                .join(' ');
              const body = (
                <>
                  {isAnchor ? (
                    <span className={styles.anchorLabel}>
                      {isUpcoming(item, NARRATIVE_NOW) ? 'Up next' : 'Most recent'}
                    </span>
                  ) : null}
                  <div className={styles.eventRow}>
                    <span className={`${styles.time} ${item.time ? '' : styles.timeEmpty}`}>{item.time ?? '·'}</span>
                    <div className={styles.eventBody}>
                      <div className={styles.eventTitleRow}>
                        <span className={styles.eventTitle}>{item.title}</span>
                        {statusPill(item.status)}
                      </div>
                      <p className={styles.eventSub}>{item.subtitle}</p>
                    </div>
                  </div>
                </>
              );
              return clickable ? (
                <button
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el);
                  }}
                  type="button"
                  className={eventClassName}
                  onClick={() => navigate('/split')}
                >
                  {body}
                </button>
              ) : (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el);
                  }}
                  className={eventClassName}
                >
                  {body}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </Screen>
  );
}
