import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface ChildItem {
  id: string;
  name: string;
  age: number | null;
  emoji: string;
  kita_id: string | null;
  kita_name: string | null;
}

export function useChildren() {
  const { session } = useAuth();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('children')
      .select('id, name, age, emoji, kita_id, kitas(name)')
      .order('name')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        setChildren(
          ((data as any[]) ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            age: c.age,
            emoji: c.emoji ?? '🌻',
            kita_id: c.kita_id,
            kita_name: c.kitas?.name ?? null,
          }))
        );
        setLoading(false);
      });
  }, [session?.user.id]);

  return { children, firstChild: children[0] ?? null, loading };
}
