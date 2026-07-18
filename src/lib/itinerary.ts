/**
 * itinerary.ts — chronological day-grouping + "anchor to now" for the Trip Hub timeline (issue #12).
 *
 * Ordering and anchor selection share one comparator so the two can never disagree: an item without a
 * `time` is treated as occurring at the very end of its day (it's a flexible "anytime" stop), which is
 * why it sorts last within the day and also why it won't get picked as the imminent "next" item ahead
 * of a timed one on the same day.
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

/**
 * The id to scroll to and visually emphasize on load: the next item still ahead of `now`, or — once
 * nothing's left today (the "last evening of trip" case) — the most recent item overall. Returns null
 * for an empty itinerary.
 */
export function findAnchorId(items: ItineraryItem[], now: Date): string | null {
  if (items.length === 0) return null;
  const sorted = groupItineraryByDay(items).flatMap((group) => group.items);
  const nowMs = now.getTime();
  const next = sorted.find((item) => itemTimestamp(item) > nowMs);
  return (next ?? sorted[sorted.length - 1]).id;
}

/** Whether an item is still ahead of `now` — distinguishes "Up next" from the "Most recent" fallback. */
export function isUpcoming(item: ItineraryItem, now: Date): boolean {
  return itemTimestamp(item) > now.getTime();
}
