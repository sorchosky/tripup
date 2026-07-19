/**
 * Screen 2 — Trip detail / group view. The hub Ari returns to between steps: the group, the itinerary,
 * and the money. Chrome is the shared liquid-glass tab bar (Trips active) plus a right-side glass FAB
 * for the two quick actions that used to live behind the single evolving footer CTA — starting a poll
 * and adding a stop to the itinerary. The rest of the linear journey (poll → split → settle) is reached
 * from the itinerary itself: an open poll surfaces as a tappable banner, a pending expense as a
 * tappable itinerary row.
 */

import { useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Pill, AvatarGroup, TabBar, Fab, Menu, type MenuItemDef } from '../components/ui';
import { ArrowLeft, Ellipsis, Vote, CalendarPlus, Edit, Users, Trash2, Check, MapPin, ChevronRight } from '../components/icons';
import { TRIP, COFFEE_STOP_ITINERARY_ITEM, DINNER_ITINERARY_ITEM } from '../data/mock';
import { useTrip } from '../state/TripContext';
import type { ItineraryItem, ItineraryStatus } from '../data/mock';
import { formatDateRange, formatItineraryDay } from '../lib/dates';
import { groupItineraryByDay } from '../lib/itinerary';
import styles from './TripDetailScreen.module.css';

function statusPill(status: ItineraryStatus) {
  if (status === 'paid') return <Pill tone="settled">Paid</Pill>;
  if (status === 'pending') return <Pill tone="owed">Pending</Pill>;
  return null;
}

/**
 * Rail-node glyph + tone per row (issue #47's Oura-style timeline): `paid` reads as done (settled
 * check), `pending`/`planned` share the same "stop ahead" pin, `pending` just tinted with the owed
 * role so an unpaid dinner still reads distinctly on the rail, not only via its status pill.
 */
function nodeTone(status: ItineraryStatus): { icon: ReactNode; toneClass: string } {
  if (status === 'paid') return { icon: <Check size={14} strokeWidth={2.5} />, toneClass: styles.nodePaid };
  if (status === 'pending') return { icon: <MapPin size={14} />, toneClass: styles.nodePending };
  return { icon: <MapPin size={14} />, toneClass: styles.nodePlanned };
}

/**
 * Where tapping a row goes — only the dinner card has a real downstream screen in this build (the
 * receipt/split flow while it's still owed, the settle-up screen once it's paid). Every other stop
 * (check-in, landmarks, meals) doesn't have a detail screen in the ≤10-screen build order yet, so it's
 * still a real, focusable button (Oura-consistent card + chevron) but a no-op tap — same intentional-
 * stub precedent as the trip-options menu's "Edit trip details" (docs/decisions.md, issue #14).
 */
function routeForItem(item: ItineraryItem): string | null {
  if (item.id !== DINNER_ITINERARY_ITEM.id) return null;
  return item.status === 'paid' ? '/settle' : '/split';
}

// Matches `.navHeader`'s fixed height (ui.module.css) / `.scrollPadTopNav`'s clearance
// (Screen.module.css) — the same literal-height convention those already use.
const NAV_HEADER_HEIGHT = 56;

export default function TripDetailScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const tripMenuBtnRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Issue #48: fades "Lisbon 2026" into the floating NavHeader once the in-body <h1> scrolls under it.
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);

  const dayGroups = useMemo(() => groupItineraryByDay(state.itinerary), [state.itinerary]);

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const titleEl = titleRef.current;
    if (!titleEl) return;
    const headerBottom = e.currentTarget.getBoundingClientRect().top + NAV_HEADER_HEIGHT;
    setShowHeaderTitle(titleEl.getBoundingClientRect().bottom <= headerBottom);
  }

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

  const tripMenuItems: MenuItemDef[] = [
    {
      key: 'edit-trip',
      label: 'Edit trip details',
      icon: <Edit size={18} />,
      onSelect: () => {},
    },
    {
      key: 'participants',
      label: 'Add/edit participants',
      icon: <Users size={18} />,
      onSelect: () => navigate('/trip/add'),
    },
    {
      key: 'delete-trip',
      label: 'Delete trip',
      icon: <Trash2 size={18} />,
      onSelect: () => {},
      tone: 'destructive',
    },
  ];

  return (
    <Screen
      onScroll={handleScroll}
      nav={
        <NavHeader
          onBack={() => navigate('/')}
          leftIcon={<ArrowLeft />}
          leftAriaLabel="Back to trips"
          centerTitle={TRIP.name}
          centerTitleVisible={showHeaderTitle}
          rightIcon={<Ellipsis />}
          rightAriaLabel="Trip options"
          onRight={() => setTripMenuOpen((open) => !open)}
          rightRef={tripMenuBtnRef}
          rightExpanded={tripMenuOpen}
          menu={
            <Menu
              open={tripMenuOpen}
              onClose={() => setTripMenuOpen(false)}
              anchorRef={tripMenuBtnRef}
              items={tripMenuItems}
              align="end"
              side="bottom"
            />
          }
        />
      }
      tabBar={
        <div className={styles.chrome}>
          <div className={styles.tabBarFlex}>
            <TabBar />
          </div>
          <Fab items={fabItems} ariaLabel="Add to trip" icon={CalendarPlus} />
        </div>
      }
    >
      <div className={styles.overview}>
        <h1 className={styles.title} ref={titleRef}>{TRIP.name}</h1>
        <p className={styles.subtitle}>
          {TRIP.destination} · {formatDateRange(TRIP.dates.start, TRIP.dates.end)}
        </p>

        <div className={styles.memberRow}>
          <AvatarGroup
            personIds={state.participants.map((p) => p.id)}
            size="md"
            onClick={() => navigate('/trip/add')}
            ariaLabel="Edit participants"
          />
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
            {group.items.map((item, index) => {
              const { icon, toneClass } = nodeTone(item.status);
              const route = routeForItem(item);
              const isLast = index === group.items.length - 1;
              return (
                <div key={item.id} className={styles.row}>
                  <div className={styles.rail}>
                    <span className={`${styles.node} ${toneClass}`} aria-hidden>
                      {icon}
                    </span>
                    {!isLast ? <span className={styles.connector} aria-hidden /> : null}
                  </div>
                  <button
                    type="button"
                    className={styles.event}
                    onClick={() => {
                      if (route) navigate(route);
                    }}
                  >
                    <span className={`${styles.time} ${item.time ? '' : styles.timeEmpty}`}>{item.time ?? '·'}</span>
                    <div className={styles.eventBody}>
                      <div className={styles.eventTitleRow}>
                        <span className={styles.eventTitle}>{item.title}</span>
                        {statusPill(item.status)}
                      </div>
                      <p className={styles.eventSub}>{item.subtitle}</p>
                    </div>
                    <ChevronRight size={18} className={styles.chevron} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </Screen>
  );
}
