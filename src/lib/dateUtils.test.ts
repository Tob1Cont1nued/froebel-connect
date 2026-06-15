import { describe, it, expect } from 'vitest';
import { localDateStr, addDays, getMonday, isoWeekNumber, isDateInRange } from './dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// localDateStr
// ─────────────────────────────────────────────────────────────────────────────
describe('localDateStr', () => {
  it('formats a normal date', () => {
    expect(localDateStr(new Date(2026, 5, 15))).toBe('2026-06-15'); // June = month 5
  });

  it('pads single-digit month and day with zero', () => {
    expect(localDateStr(new Date(2026, 0, 7))).toBe('2026-01-07');
  });

  it('handles year boundary (Dec 31)', () => {
    expect(localDateStr(new Date(2025, 11, 31))).toBe('2025-12-31');
  });

  it('handles year boundary (Jan 1)', () => {
    expect(localDateStr(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('is timezone-safe: midnight local time does not shift to previous day', () => {
    const d = new Date(2026, 5, 15);
    d.setHours(0, 0, 0, 0);
    expect(localDateStr(d)).toBe('2026-06-15');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addDays
// ─────────────────────────────────────────────────────────────────────────────
describe('addDays', () => {
  it('adds positive days', () => {
    const d = new Date(2026, 5, 10); // June 10
    expect(localDateStr(addDays(d, 4))).toBe('2026-06-14');
  });

  it('subtracts days with negative n', () => {
    const d = new Date(2026, 5, 10);
    expect(localDateStr(addDays(d, -3))).toBe('2026-06-07');
  });

  it('crosses month boundary', () => {
    const d = new Date(2026, 5, 29); // June 29
    expect(localDateStr(addDays(d, 3))).toBe('2026-07-02');
  });

  it('crosses year boundary', () => {
    const d = new Date(2025, 11, 30); // Dec 30
    expect(localDateStr(addDays(d, 3))).toBe('2026-01-02');
  });

  it('handles zero — returns same date', () => {
    const d = new Date(2026, 5, 15);
    expect(localDateStr(addDays(d, 0))).toBe('2026-06-15');
  });

  it('does not mutate the original date', () => {
    const d = new Date(2026, 5, 15);
    addDays(d, 7);
    expect(localDateStr(d)).toBe('2026-06-15');
  });

  it('handles Feb 28 → Feb 29 in a leap year', () => {
    const d = new Date(2028, 1, 28); // Feb 28 2028 (leap year)
    expect(localDateStr(addDays(d, 1))).toBe('2028-02-29');
  });

  it('handles Feb 28 → Mar 1 in a non-leap year', () => {
    const d = new Date(2026, 1, 28);
    expect(localDateStr(addDays(d, 1))).toBe('2026-03-01');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMonday
// ─────────────────────────────────────────────────────────────────────────────
describe('getMonday', () => {
  it('returns the same day if input is already a Monday', () => {
    const mon = new Date(2026, 5, 15); // Monday June 15 2026
    expect(localDateStr(getMonday(mon))).toBe('2026-06-15');
  });

  it('steps back to Monday from Wednesday', () => {
    const wed = new Date(2026, 5, 17); // Wednesday
    expect(localDateStr(getMonday(wed))).toBe('2026-06-15');
  });

  it('steps back to Monday from Friday', () => {
    const fri = new Date(2026, 5, 19);
    expect(localDateStr(getMonday(fri))).toBe('2026-06-15');
  });

  it('steps back to previous Monday from Sunday', () => {
    const sun = new Date(2026, 5, 21); // Sunday — belongs to next week's Monday in DE
    expect(localDateStr(getMonday(sun))).toBe('2026-06-15');
  });

  it('crosses month boundary (Tuesday July 1 → Monday June 30)', () => {
    const tue = new Date(2025, 6, 1); // Tue July 1 2025
    expect(localDateStr(getMonday(tue))).toBe('2025-06-30');
  });

  it('crosses year boundary (Thursday Jan 1 2026 → Monday Dec 29 2025)', () => {
    const thu = new Date(2026, 0, 1); // Thu Jan 1 2026
    expect(localDateStr(getMonday(thu))).toBe('2025-12-29');
  });

  it('does not mutate the original date', () => {
    const d = new Date(2026, 5, 17);
    getMonday(d);
    expect(localDateStr(d)).toBe('2026-06-17');
  });

  it('zeroes out time component', () => {
    const d = new Date(2026, 5, 17, 14, 30, 59);
    const mon = getMonday(d);
    expect(mon.getHours()).toBe(0);
    expect(mon.getMinutes()).toBe(0);
    expect(mon.getSeconds()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isoWeekNumber
// ─────────────────────────────────────────────────────────────────────────────
describe('isoWeekNumber', () => {
  it('returns KW 25 for June 15 2026 (ISO)', () => {
    expect(isoWeekNumber(new Date(2026, 5, 15))).toBe(25);
  });

  it('returns KW 1 for Jan 6 2025 (first full ISO week)', () => {
    expect(isoWeekNumber(new Date(2025, 0, 6))).toBe(2);
  });

  it('returns KW 1 for Dec 29 2025 (ISO week 1 of 2026)', () => {
    // Dec 29 2025 is Monday of ISO week 1 2026
    expect(isoWeekNumber(new Date(2025, 11, 29))).toBe(1);
  });

  it('returns KW 52 for Dec 22 2025', () => {
    expect(isoWeekNumber(new Date(2025, 11, 22))).toBe(52);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isDateInRange
// ─────────────────────────────────────────────────────────────────────────────
describe('isDateInRange', () => {
  it('returns true for date within range', () => {
    expect(isDateInRange('2026-06-17', '2026-06-15', '2026-06-19')).toBe(true);
  });

  it('returns true on lower boundary (Monday)', () => {
    expect(isDateInRange('2026-06-15', '2026-06-15', '2026-06-19')).toBe(true);
  });

  it('returns true on upper boundary (Friday)', () => {
    expect(isDateInRange('2026-06-19', '2026-06-15', '2026-06-19')).toBe(true);
  });

  it('returns false for date before range', () => {
    expect(isDateInRange('2026-06-14', '2026-06-15', '2026-06-19')).toBe(false);
  });

  it('returns false for date after range', () => {
    expect(isDateInRange('2026-06-20', '2026-06-15', '2026-06-19')).toBe(false);
  });

  it('returns true when fromStr === toStr and date matches', () => {
    expect(isDateInRange('2026-06-15', '2026-06-15', '2026-06-15')).toBe(true);
  });

  it('returns false when fromStr === toStr and date does not match', () => {
    expect(isDateInRange('2026-06-16', '2026-06-15', '2026-06-15')).toBe(false);
  });
});
