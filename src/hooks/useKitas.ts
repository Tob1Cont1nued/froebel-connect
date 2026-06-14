import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface KitaItem {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  created_at: string;
  childrenCount: number;
  staffCount: number;
}

export function useKitas() {
  const { session } = useAuth();
  const [kitas, setKitas] = useState<KitaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const [{ data: kitasData }, { data: childData }, { data: staffData }] = await Promise.all([
      sb.from('kitas').select('id, name, city, address, created_at').order('name'),
      sb.from('children').select('kita_id'),
      sb.from('profiles').select('kita_id').eq('role', 'fachkraft'),
    ]);

    const childMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (childData ?? []).forEach((c: any) => {
      if (c.kita_id) childMap.set(c.kita_id, (childMap.get(c.kita_id) ?? 0) + 1);
    });

    const staffMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (staffData ?? []).forEach((p: any) => {
      if (p.kita_id) staffMap.set(p.kita_id, (staffMap.get(p.kita_id) ?? 0) + 1);
    });

    setKitas(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (kitasData ?? []).map((k: any) => ({
        id: k.id,
        name: k.name,
        city: k.city ?? null,
        address: k.address ?? null,
        created_at: k.created_at,
        childrenCount: childMap.get(k.id) ?? 0,
        staffCount: staffMap.get(k.id) ?? 0,
      }))
    );
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => { load(); }, [load]);

  const createKita = async (data: { name: string; city: string; address: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('kitas').insert(data);
    if (!error) await load();
    return error;
  };

  const updateKita = async (id: string, data: { name: string; city: string; address: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('kitas').update(data).eq('id', id);
    if (!error) await load();
    return error;
  };

  const deleteKita = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('kitas').delete().eq('id', id);
    if (!error) await load();
    return error;
  };

  return { kitas, loading, refetch: load, createKita, updateKita, deleteKita };
}
