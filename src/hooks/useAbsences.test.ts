import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAbsences } from './useAbsences';
import { makeChain } from '../test/mocks/supabase';
import { FAKE_ELTERN_PROFILE, FAKE_ELTERN_SESSION } from '../test/mocks/auth';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../lib/supabase', () => ({ supabase: { from: mockFrom } }));
vi.mock('../context/AuthContext');
import { useAuth } from '../context/AuthContext';

// ── Test data ─────────────────────────────────────────────────────────────────

const DB_ROW_A = {
  id: 'abs-1',
  child_id: 'child-1',
  from_date: '2026-06-16',
  to_date:   '2026-06-17',
  reason:    'Urlaub',
  note:      null,
  status:    'pending',
  children:  { name: 'Lena Müller', emoji: '🌻', photo_url: null },
};

const DB_ROW_B = {
  id: 'abs-2',
  child_id: 'child-2',
  from_date: '2026-06-20',
  to_date:   '2026-06-20',
  reason:    'Krank',
  note:      'Fieber',
  status:    'confirmed',
  children:  { name: 'Max Müller', emoji: '🚀', photo_url: null },
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    profile: FAKE_ELTERN_PROFILE as any,
    session: FAKE_ELTERN_SESSION,
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAbsences — initial load', () => {
  it('fetches and maps absences from DB on mount', async () => {
    mockFrom.mockReturnValue(makeChain([DB_ROW_A, DB_ROW_B]));
    const { result } = renderHook(() => useAbsences());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.absences).toHaveLength(2);
    expect(result.current.absences[0].reason).toBe('Urlaub');
    expect(result.current.absences[1].status).toBe('confirmed');
  });

  it('maps DB rows to AbsenceItems with correct child info', async () => {
    mockFrom.mockReturnValue(makeChain([DB_ROW_A]));
    const { result } = renderHook(() => useAbsences());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const item = result.current.absences[0];
    expect(item.childName).toBe('Lena Müller');
    expect(item.childEmoji).toBe('🌻');
    expect(item.childPhotoUrl).toBeNull();
  });

  it('maps from_date and to_date as Date objects', async () => {
    mockFrom.mockReturnValue(makeChain([DB_ROW_A]));
    const { result } = renderHook(() => useAbsences());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const item = result.current.absences[0];
    expect(item.from).toBeInstanceOf(Date);
    expect(item.to).toBeInstanceOf(Date);
  });

  it('does not fetch and stays loading when session is null', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: null, session: null, user: null, loading: false,
      signIn: vi.fn(), signOut: vi.fn(), updateProfile: vi.fn(),
    });
    const { result } = renderHook(() => useAbsences());

    // session is null → load() returns early before setLoading(false)
    expect(mockFrom).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('returns empty list when DB returns no rows', async () => {
    mockFrom.mockReturnValue(makeChain([]));
    const { result } = renderHook(() => useAbsences());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.absences).toHaveLength(0);
  });
});

describe('useAbsences — addAbsence', () => {
  const NEW_ABSENCE = {
    childId: 'child-1',
    from:    new Date('2026-07-01'),
    to:      new Date('2026-07-03'),
    reason:  'Urlaub',
    note:    'Familienreise',
  };

  it('prepends the new absence to the existing list', async () => {
    const insertedRow = { ...DB_ROW_A, id: 'abs-new', from_date: '2026-07-01', to_date: '2026-07-03', reason: 'Urlaub', note: 'Familienreise' };

    const insertChain = makeChain(null);
    insertChain.single = vi.fn().mockResolvedValue({ data: insertedRow, error: null });

    mockFrom
      .mockReturnValueOnce(makeChain([DB_ROW_B]))  // initial load
      .mockReturnValueOnce(insertChain);            // insert

    const { result } = renderHook(() => useAbsences());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addAbsence(NEW_ABSENCE);
    });

    expect(result.current.absences).toHaveLength(2);
    expect(result.current.absences[0].id).toBe('abs-new'); // prepended
  });

  it('does not add when session is missing', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: null, session: null, user: null, loading: false,
      signIn: vi.fn(), signOut: vi.fn(), updateProfile: vi.fn(),
    });
    mockFrom.mockReturnValue(makeChain([]));
    const { result } = renderHook(() => useAbsences());

    const countBefore = mockFrom.mock.calls.length;
    await act(async () => {
      await result.current.addAbsence(NEW_ABSENCE);
    });

    expect(mockFrom.mock.calls.length).toBe(countBefore); // no additional call
  });

  it('does not add when DB returns no data', async () => {
    const insertChain = makeChain(null);
    insertChain.single = vi.fn().mockResolvedValue({ data: null, error: null });

    mockFrom
      .mockReturnValueOnce(makeChain([DB_ROW_A]))
      .mockReturnValueOnce(insertChain);

    const { result } = renderHook(() => useAbsences());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addAbsence(NEW_ABSENCE);
    });

    expect(result.current.absences).toHaveLength(1); // list unchanged
  });
});
