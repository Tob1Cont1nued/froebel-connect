import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ChildItem } from './useChildren';

export function useKitaChildren() {
  const { session, profile } = useAuth();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('children')
      .select('id, name, age, emoji, kita_id, kitas(name)')
      .eq('kita_id', profile.kita_id)
      .order('name')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        setChildren(
          (data ?? []).map((c) => ({
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
  }, [session?.user.id, profile?.kita_id]);

  return { children, loading };
}
