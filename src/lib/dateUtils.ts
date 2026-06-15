/**
 * Timezone-safe YYYY-MM-DD string using local date getters.
 * Avoids the UTC-midnight shift of toISOString().
 */
export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Returns a new Date that is n days after d (original untouched). */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Returns the Monday of the ISO week containing date (time zeroed). */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/** ISO 8601 calendar week number for a given Monday. */
export function isoWeekNumber(monday: Date): number {
  const d = new Date(monday);
  d.setHours(12);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

/**
 * Returns true if dateStr (YYYY-MM-DD) falls within [fromStr, toStr] inclusive.
 * All strings must be YYYY-MM-DD. String comparison works for ISO dates.
 */
export function isDateInRange(dateStr: string, fromStr: string, toStr: string): boolean {
  return dateStr >= fromStr && dateStr <= toStr;
}
