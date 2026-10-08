import type { Frequency } from "./events";

const DIGEST_HOUR_UTC = 14;

// The next digest send time: 14:00 UTC tomorrow (daily) or next Monday.
export function nextWindow(frequency: Frequency, from: Date = new Date()): Date {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), DIGEST_HOUR_UTC));
  if (frequency === "daily") {
    if (next.getTime() <= from.getTime()) next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }
  if (frequency === "weekly") {
    const daysUntilMonday = (8 - next.getUTCDay()) % 7;
    next.setUTCDate(next.getUTCDate() + daysUntilMonday);
    if (next.getTime() <= from.getTime()) next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }
  return from;
}
