import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKrankmeldungen } from './useKrankmeldungen';
import { makeChain } from '../test/mocks/supabase';
import { FAKE_PROFILE } from '../test/mocks/auth';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../lib/supabase', () => ({ supabase: { from: mockFrom } }));
vi.mock('../context/AuthContext');
import { useAuth } from '../context/AuthContext';

// ── Test data ─────────────────────────────────────────────────────────────────

const TODAY = '2026-06-15';

const MELDUNG_ACTIVE = {
  id: 'km-1',
  fachkraft_id: FAKE_PROFILE.id,
  kita_id: FAKE_PROFILE.kita_id,
  from_date: TODAY,
  to_date: '2026-06-19',
  note: null,
  created_at: '2026-06-15T07:00:00Z',
  profiles: { name: FAKE_PROFILE.name },
};

const MELDUNG_OTHER = {
  id: 'km-2',
  fachkraft_id: 'other-fachkraft',
  kita_id: FAKE_PROFILE.kita_id,
  from_date: '2026-06-16',
  to_date: '2026-06-18',
  note: 'Erkältung',
  created_at: '2026-06-15T08:00:00Z',
  profiles: { name: 'Andere Kollegin' },
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    profile: FAKE_PROFILE as any,
    session: null,
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useKrankmeldungen — initial load', () => {
  it('fetches and maps krankmeldungen from DB', async () => {
    mockFrom.mockReturnValue(makeChain([MELDUNG_ACTIVE, MELDUNG_OTHER]));
    const { result } = renderHook(() => useKrankmeldungen());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.krankmeldungen).toHaveLength(2);
    expect(result.current.krankmeldungen[0].fachkraft_name).toBe(FAKE_PROFILE.name);
    expect(result.current.krankmeldungen[1].fachkraft_name).toBe('Andere Kollegin');
    expect(result.current.krankmeldungen[1].note).toBe('Erkältung');
  });

  it('sets fachkraft_name to "Unbekannt" when profiles join is null', async () => {
    const row = { ...MELDUNG_OTHER, profiles: null };
    mockFrom.mockReturnValue(makeChain([row]));
    const { result } = renderHook(() => useKrankmeldungen());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.krankmeldungen[0].fachkraft_name).toBe('Unbekannt');
  });

  it('does not fetch when kita_id is null', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { ...FAKE_PROFILE, kita_id: null } as any,
      session: null, user: null, loading: false,
      signIn: vi.fn(), signOut: vi.fn(), updateProfile: vi.fn(),
    });

    const { result } = renderHook(() => useKrankmeldungen());
    // loading stays true when kita_id is null (no load call)
    expect(result.current.loading).toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe('useKrankmeldungen — computed: aktuellKrank / eigeneMeldung', () => {
  it('aktuellKrank contains meldungen that overlap today', async () => {
    mockFrom.mockReturnValue(makeChain([MELDUNG_ACTIVE, MELDUNG_OTHER]));
    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // MELDUNG_ACTIVE starts today, MELDUNG_OTHER starts tomorrow
    expect(result.current.aktuellKrank.map((k) => k.id)).toContain('km-1');
    expect(result.current.aktuellKrank.map((k) => k.id)).not.toContain('km-2');
  });

  it('eigeneMeldung returns the own (current user) meldung', async () => {
    mockFrom.mockReturnValue(makeChain([MELDUNG_ACTIVE, MELDUNG_OTHER]));
    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.eigeneMeldung?.id).toBe('km-1');
  });

  it('eigeneMeldung is null when user has no active meldung', async () => {
    mockFrom.mockReturnValue(makeChain([MELDUNG_OTHER]));
    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.eigeneMeldung).toBeNull();
  });
});

describe('useKrankmeldungen — melden', () => {
  it('inserts a new meldung and reloads the list', async () => {
    const loadChain   = makeChain([]);
    const insertChain = makeChain(null); // insert returns no data, just triggers reload
    const reloadChain = makeChain([MELDUNG_ACTIVE]);
    mockFrom
      .mockReturnValueOnce(loadChain)
      .mockReturnValueOnce(insertChain)
      .mockReturnValueOnce(reloadChain);

    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let error: string | null = 'initial';
    await act(async () => {
      error = await result.current.melden('2026-06-15', '2026-06-19');
    });

    expect(error).toBeNull(); // no error
    expect(result.current.krankmeldungen).toHaveLength(1);
  });

  it('returns an error message when DB insert fails', async () => {
    const loadChain   = makeChain([]);
    const insertChain = makeChain(null, { message: 'DB-Fehler' });
    mockFrom
      .mockReturnValueOnce(loadChain)
      .mockReturnValueOnce(insertChain);

    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let error: string | null = null;
    await act(async () => {
      error = await result.current.melden('2026-06-15', '2026-06-19');
    });

    expect(error).toBe('DB-Fehler');
  });
});

describe('useKrankmeldungen — zurueckziehen', () => {
  it('optimistically removes the meldung from the list', async () => {
    const deleteChain = makeChain(null);
    mockFrom
      .mockReturnValueOnce(makeChain([MELDUNG_ACTIVE]))
      .mockReturnValueOnce(deleteChain);

    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.zurueckziehen(MELDUNG_ACTIVE.id);
    });

    expect(result.current.krankmeldungen).toHaveLength(0);
  });

  it('reverts the list when the DB delete fails', async () => {
    const deleteChain  = makeChain(null, { message: 'Delete fehlgeschlagen' });
    const reloadChain  = makeChain([MELDUNG_ACTIVE]);
    mockFrom
      .mockReturnValueOnce(makeChain([MELDUNG_ACTIVE]))
      .mockReturnValueOnce(deleteChain)
      .mockReturnValueOnce(reloadChain);

    const { result } = renderHook(() => useKrankmeldungen());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.zurueckziehen(MELDUNG_ACTIVE.id);
    });

    // after failed delete, reload is called → list is restored
    expect(result.current.krankmeldungen).toHaveLength(1);
  });
});
