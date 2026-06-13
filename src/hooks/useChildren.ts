import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface ChildItem {
  id: string;
  name: string;
  age: number | null;
  emoji: string;
  photo_url: string | null;
  kita_id: string | null;
  kita_name: string | null;
}

export function useChildren() {
  const { session } = useAuth();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('parent_children')
      .select('children(id, name, age, emoji, photo_url, kita_id, kitas(name))')
      .eq('parent_id', session.user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        setChildren(
          (data ?? []).map((row) => {
            const c = row.children;
            return {
              id: c.id,
              name: c.name,
              age: c.age,
              emoji: c.emoji ?? '🌻',
              photo_url: c.photo_url ?? null,
              kita_id: c.kita_id,
              kita_name: c.kitas?.name ?? null,
            };
          }).sort((a: ChildItem, b: ChildItem) => a.name.localeCompare(b.name))
        );
        setLoading(false);
      });
  }, [session?.user.id]);

  useEffect(() => { load(); }, [load]);

  return { children, firstChild: children[0] ?? null, loading, refetch: load };
}
