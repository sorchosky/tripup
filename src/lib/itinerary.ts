/**
 * itinerary.ts — chronological day-grouping for the Trip Hub timeline.
 *
 * An item without a `time` is treated as occurring at the very end of its day (it's a flexible
 * "anytime" stop), which is why it sorts last within the day.
 *
 * Previously also exported `findAnchorId`/`isUpcoming` (issue #12's "anchor to now" — scroll-and-
 * demote to the next-up item on load). Issue #47 replaced that with an Oura-style timeline the hub
 * opens scrolled to the top, with every item rendered the same way — see docs/decisions.md.
 */

import type { ItineraryItem } from '../data/mock';

const END_OF_DAY = '23:59:59';

function itemTimestamp(item: ItineraryItem): number {
  const time = item.time ? `${item.time}:00` : END_OF_DAY;
  return new Date(`${item.day}T${time}Z`).getTime();
}

function compareItems(a: ItineraryItem, b: ItineraryItem): number {
  return itemTimestamp(a) - itemTimestamp(b);
}

export interface ItineraryDayGroup {
  day: string;
  items: ItineraryItem[];
}

/** Groups items by `day`, days ascending, and within each day earliest → latest (null-time items last). */
export function groupItineraryByDay(items: ItineraryItem[]): ItineraryDayGroup[] {
  const byDay = new Map<string, ItineraryItem[]>();
  for (const item of items) {
    const bucket = byDay.get(item.day);
    if (bucket) bucket.push(item);
    else byDay.set(item.day, [item]);
  }

  return [...byDay.entries()]
    .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
    .map(([day, dayItems]) => ({ day, items: [...dayItems].sort(compareItems) }));
}
