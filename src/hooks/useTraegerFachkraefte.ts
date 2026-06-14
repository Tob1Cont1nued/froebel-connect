import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface FachkraftItem {
  id: string;
  name: string;
  email: string;
  kita_id: string | null;
  kita_name: string | null;
  created_at: string;
}

export function useTraegerFachkraefte() {
  const { session } = useAuth();
  const [fachkraefte, setFachkraefte] = useState<FachkraftItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('get_fachkraefte');
    setFachkraefte(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        kita_id: r.kita_id ?? null,
        kita_name: r.kita_name ?? null,
        created_at: r.created_at,
      }))
    );
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => { load(); }, [load]);

  const createFachkraft = async (data: { email: string; name: string; kita_id: string; password: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any).rpc('create_fachkraft', {
      p_email: data.email,
      p_name: data.name,
      p_kita_id: data.kita_id || null,
      p_password: data.password,
    });
    if (!error) await load();
    return { result, error };
  };

  const updateFachkraft = async (id: string, data: { name: string; kita_id: string | null }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ name: data.name, kita_id: data.kita_id || null })
      .eq('id', id);
    if (!error) await load();
    return error;
  };

  const deleteFachkraft = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('profiles').delete().eq('id', id);
    if (!error) await load();
    return error;
  };

  return { fachkraefte, loading, refetch: load, createFachkraft, updateFachkraft, deleteFachkraft };
}
