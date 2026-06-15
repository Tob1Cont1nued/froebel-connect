import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from './useTodos';
import { makeChain } from '../test/mocks/supabase';
import { FAKE_PROFILE } from '../test/mocks/auth';

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../lib/supabase', () => ({ supabase: { from: mockFrom } }));
vi.mock('../context/AuthContext');
import { useAuth } from '../context/AuthContext';

// ── Test data ─────────────────────────────────────────────────────────────────

const TODO_A = { id: 'todo-1', text: 'Elternbriefe vorbereiten', done: false, created_at: '2026-06-01T08:00:00Z' };
const TODO_B = { id: 'todo-2', text: 'Dienstplan prüfen',         done: true,  created_at: '2026-06-02T08:00:00Z' };

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

describe('useTodos — initial load', () => {
  it('fetches todos for the current profile on mount', async () => {
    mockFrom.mockReturnValue(makeChain([TODO_A, TODO_B]));
    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledWith('todos');
  });

  it('splits todos into open and done', async () => {
    mockFrom.mockReturnValue(makeChain([TODO_A, TODO_B]));
    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.open).toEqual([TODO_A]);
    expect(result.current.done).toEqual([TODO_B]);
  });

  it('returns empty lists when DB returns no todos', async () => {
    mockFrom.mockReturnValue(makeChain([]));
    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toHaveLength(0);
  });

  it('does not fetch and leaves loading false when profile is null', async () => {
    vi.mocked(useAuth).mockReturnValue({ profile: null, session: null, user: null, loading: false, signIn: vi.fn(), signOut: vi.fn(), updateProfile: vi.fn() });
    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFrom).not.toHaveBeenCalled();
    expect(result.current.todos).toHaveLength(0);
  });
});

describe('useTodos — add', () => {
  const NEW_TODO = { id: 'todo-3', text: 'Neue Aufgabe', done: false, created_at: '2026-06-15T09:00:00Z' };

  it('appends the new todo returned by DB to the list', async () => {
    const loadChain   = makeChain([TODO_A]);
    const insertChain = makeChain(NEW_TODO);
    insertChain.single = vi.fn().mockResolvedValue({ data: NEW_TODO, error: null });
    mockFrom
      .mockReturnValueOnce(loadChain)
      .mockReturnValueOnce(insertChain);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.add('Neue Aufgabe');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[1].text).toBe('Neue Aufgabe');
  });

  it('does not add when text is empty', async () => {
    mockFrom.mockReturnValue(makeChain([]));
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.add('   '); });
    expect(mockFrom).toHaveBeenCalledTimes(1); // only initial load, no insert
  });
});

describe('useTodos — toggle', () => {
  it('optimistically flips the done flag', async () => {
    const updateChain = makeChain(null);
    mockFrom
      .mockReturnValueOnce(makeChain([TODO_A]))
      .mockReturnValueOnce(updateChain);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.toggle(TODO_A.id); });

    expect(result.current.todos[0].done).toBe(true);
  });

  it('does nothing when id is not found', async () => {
    mockFrom.mockReturnValue(makeChain([TODO_A]));
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = mockFrom.mock.calls.length;
    await act(async () => { await result.current.toggle('nonexistent-id'); });

    expect(mockFrom.mock.calls.length).toBe(callsBefore); // no extra DB call
  });
});

describe('useTodos — remove', () => {
  it('optimistically removes the todo from the list', async () => {
    mockFrom
      .mockReturnValueOnce(makeChain([TODO_A, TODO_B]))
      .mockReturnValueOnce(makeChain(null));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.remove(TODO_A.id); });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe(TODO_B.id);
  });
});
