/**
 * dates.ts — date-range formatting + "days left"/"day eyebrow" helpers for trip cards and the
 * itinerary timeline.
 *
 * The flow narrates around a fixed "today" (Jun 17, 2026 — the day the Cervejaria Ramiro dinner is
 * logged). That's a deliberate demo constant, not `Date.now()` — real wall-clock time would desync the
 * narrative from the mock data.
 */

export const NARRATIVE_TODAY = new Date('2026-06-17T00:00:00Z');

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const WEEKDAY_FORMAT = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
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

/** "Wed · Jun 17" — a per-day eyebrow label for the itinerary timeline (dateISO is a plain "YYYY-MM-DD"). */
export function formatItineraryDay(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  return `${WEEKDAY_FORMAT.format(date)} · ${MONTH_FORMAT.format(date)} ${date.getUTCDate()}`;
}

/**
 * "Jun 17 · 6:32 PM" — a date/time eyebrow for a single feed cell (Activity feed, issue #104).
 * `dateISO` is a plain "YYYY-MM-DD"; `time` is an already-formatted clock string ("6:32 PM") pulled
 * from mock data (`DINNER_POLL.closedAt`, `SETTLEMENT_TIMELINE`, …) — this only assembles the label,
 * it never invents a time.
 */
export function formatFeedEyebrow(dateISO: string, time: string): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  return `${MONTH_FORMAT.format(date)} ${date.getUTCDate()} · ${time}`;
}

/**
 * "Jun 17" — date-only feed eyebrow for a cell with no fixed clock reading in the mock data (an
 * in-progress poll: individual votes aren't timestamped, so a clock time here would be invented).
 */
export function formatFeedEyebrowDateOnly(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  return `${MONTH_FORMAT.format(date)} ${date.getUTCDate()}`;
}
