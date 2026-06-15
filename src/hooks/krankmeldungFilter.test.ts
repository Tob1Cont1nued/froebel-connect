import { describe, it, expect } from 'vitest';
import { isDateInRange } from '../lib/dateUtils';

// These tests validate the filter logic used in useKrankmeldungen
// (aktuellKrank: from_date <= today <= to_date)
// and in the Dienstplan krankMap builder (week-range overlap).

const TODAY = '2026-06-15';

interface KrankmeldungStub {
  id: string;
  fachkraft_id: string;
  from_date: string;
  to_date: string;
}

function filterAktuellKrank(meldungen: KrankmeldungStub[], today: string) {
  return meldungen.filter((k) => isDateInRange(today, k.from_date, k.to_date));
}

function krankmeldungenOverlapWeek(
  meldungen: KrankmeldungStub[],
  weekStart: string,
  weekEnd: string,
) {
  return meldungen.filter(
    (k) => k.from_date <= weekEnd && k.to_date >= weekStart,
  );
}

const MELDUNGEN: KrankmeldungStub[] = [
  { id: '1', fachkraft_id: 'f1', from_date: '2026-06-15', to_date: '2026-06-19' }, // active this week
  { id: '2', fachkraft_id: 'f2', from_date: '2026-06-08', to_date: '2026-06-12' }, // past — ended Friday last week
  { id: '3', fachkraft_id: 'f3', from_date: '2026-06-22', to_date: '2026-06-26' }, // future — next week
  { id: '4', fachkraft_id: 'f4', from_date: '2026-06-01', to_date: '2026-06-30' }, // spans entire month
  { id: '5', fachkraft_id: 'f5', from_date: '2026-06-15', to_date: '2026-06-15' }, // exactly today only
];

describe('aktuellKrank filter (today in [from, to])', () => {
  it('includes a meldung starting today', () => {
    const result = filterAktuellKrank(MELDUNGEN, TODAY);
    expect(result.map((k) => k.id)).toContain('1');
  });

  it('excludes a meldung that ended last week', () => {
    const result = filterAktuellKrank(MELDUNGEN, TODAY);
    expect(result.map((k) => k.id)).not.toContain('2');
  });

  it('excludes a meldung starting next week', () => {
    const result = filterAktuellKrank(MELDUNGEN, TODAY);
    expect(result.map((k) => k.id)).not.toContain('3');
  });

  it('includes a meldung spanning the whole month', () => {
    const result = filterAktuellKrank(MELDUNGEN, TODAY);
    expect(result.map((k) => k.id)).toContain('4');
  });

  it('includes a single-day meldung exactly on today', () => {
    const result = filterAktuellKrank(MELDUNGEN, TODAY);
    expect(result.map((k) => k.id)).toContain('5');
  });

  it('returns empty array when no meldungen overlap today', () => {
    const result = filterAktuellKrank(MELDUNGEN, '2099-01-01');
    expect(result).toHaveLength(0);
  });
});

describe('week-range overlap (Dienstplan query logic)', () => {
  const WEEK_START = '2026-06-15';
  const WEEK_END   = '2026-06-19';

  it('includes a meldung fully within the week', () => {
    const result = krankmeldungenOverlapWeek(MELDUNGEN, WEEK_START, WEEK_END);
    expect(result.map((k) => k.id)).toContain('1');
  });

  it('excludes a meldung that ended before the week started', () => {
    const result = krankmeldungenOverlapWeek(MELDUNGEN, WEEK_START, WEEK_END);
    expect(result.map((k) => k.id)).not.toContain('2');
  });

  it('excludes a meldung that starts after the week ends', () => {
    const result = krankmeldungenOverlapWeek(MELDUNGEN, WEEK_START, WEEK_END);
    expect(result.map((k) => k.id)).not.toContain('3');
  });

  it('includes a meldung that spans the entire week', () => {
    const result = krankmeldungenOverlapWeek(MELDUNGEN, WEEK_START, WEEK_END);
    expect(result.map((k) => k.id)).toContain('4');
  });

  it('includes a meldung starting exactly on Friday (last day of week)', () => {
    const meldung: KrankmeldungStub = { id: '6', fachkraft_id: 'f6', from_date: '2026-06-19', to_date: '2026-06-25' };
    const result = krankmeldungenOverlapWeek([meldung], WEEK_START, WEEK_END);
    expect(result).toHaveLength(1);
  });

  it('includes a meldung ending exactly on Monday (first day of week)', () => {
    const meldung: KrankmeldungStub = { id: '7', fachkraft_id: 'f7', from_date: '2026-06-08', to_date: '2026-06-15' };
    const result = krankmeldungenOverlapWeek([meldung], WEEK_START, WEEK_END);
    expect(result).toHaveLength(1);
  });
});
