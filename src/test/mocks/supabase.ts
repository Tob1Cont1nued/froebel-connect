import { vi } from 'vitest';

/**
 * Builds a chainable Supabase query mock.
 *
 * All builder methods (select, eq, gte, …) return `this` so chains compile.
 * The chain itself is thenable — `await chain` resolves to { data, error }.
 * `.single()` also resolves to { data, error }.
 *
 * Usage:
 *   const chain = makeChain([{ id: '1', text: 'Todo' }]);
 *   mockFrom.mockReturnValue(chain);
 */
export function makeChain(data: unknown = null, error: unknown = null) {
  const result = { data, error };
  const chain: Record<string, unknown> = {
    select:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    neq:     vi.fn().mockReturnThis(),
    gte:     vi.fn().mockReturnThis(),
    lte:     vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    upsert:  vi.fn().mockReturnThis(),
    single:  vi.fn(() => Promise.resolve(result)),
    // make the chain itself awaitable
    then:    (res: (v: typeof result) => void, rej: (e: unknown) => void) =>
               Promise.resolve(result).then(res, rej),
    catch:   (cb: (e: unknown) => void) => Promise.resolve(result).catch(cb),
  };
  // every chaining method needs to return the same chain object
  for (const key of ['select','eq','neq','gte','lte','order','insert','update','delete','upsert']) {
    (chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  }
  return chain;
}

// Note: do NOT export mockFrom here.
// Each test file creates its own mockFrom via vi.hoisted() so that
// vi.mock() factories (which are hoisted) can close over it.
