/**
 * dates.ts — date-range formatting + "days left" helper for trip cards.
 *
 * The flow narrates around a fixed "today" (Jun 17, 2026 — the day the Cervejaria Ramiro dinner is
 * logged, and the day the itinerary's "Today" labels refer to). That's a deliberate demo constant,
 * not `Date.now()` — real wall-clock time would desync the narrative from the mock data.
 */

export const NARRATIVE_TODAY = new Date('2026-06-17T00:00:00Z');

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const DAY_MS = 24 * 60 * 60 * 1000;

/** "Jun 10–18, 2026" for a same-year range; "Mar 13 – Apr 2, 2026" if it crosses months. */
export function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const year = end.getUTCFullYear();
  const startMonth = MONTH_FORMAT.format(start);
  const endMonth = MONTH_FORMAT.format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();

  const range =
    startMonth === endMonth
      ? `${startMonth} ${startDay}–${endDay}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}`;

  return `${range}, ${year}`;
}

/** Whole days from NARRATIVE_TODAY to endISO (can be negative for past trips). */
export function daysLeft(endISO: string): number {
  const end = new Date(endISO);
  return Math.round((end.getTime() - NARRATIVE_TODAY.getTime()) / DAY_MS);
}
