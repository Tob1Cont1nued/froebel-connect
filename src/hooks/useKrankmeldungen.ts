import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Krankmeldung {
  id: string;
  fachkraft_id: string;
  fachkraft_name: string;
  from_date: string;
  to_date: string;
  note: string | null;
  created_at: string;
}

export function useKrankmeldungen() {
  const { profile } = useAuth();
  const [krankmeldungen, setKrankmeldungen] = useState<Krankmeldung[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('krankmeldungen')
      .select('*, profiles(name)')
      .eq('kita_id', profile.kita_id)
      .gte('to_date', new Date().toISOString().split('T')[0])
      .order('from_date', { ascending: true });

    setKrankmeldungen(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data ?? []).map((r: any) => ({
        id: r.id,
        fachkraft_id: r.fachkraft_id,
        fachkraft_name: r.profiles?.name ?? 'Unbekannt',
        from_date: r.from_date,
        to_date: r.to_date,
        note: r.note ?? null,
        created_at: r.created_at,
      }))
    );
    setLoading(false);
  }, [profile?.kita_id]);

  useEffect(() => { load(); }, [load]);

  const melden = async (from_date: string, to_date: string, note?: string): Promise<string | null> => {
    if (!profile?.kita_id) return 'Kein Kita-Profil gefunden.';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('krankmeldungen').insert({
      fachkraft_id: profile.id,
      kita_id: profile.kita_id,
      from_date,
      to_date,
      note: note || null,
    });
    if (error) {
      console.error('krankmeldungen insert error:', error);
      return error.message ?? 'Unbekannter Fehler';
    }
    await load();
    return null;
  };

  const zurueckziehen = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('krankmeldungen').delete().eq('id', id);
    if (!error) setKrankmeldungen((prev) => prev.filter((k) => k.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];
  const aktuellKrank = krankmeldungen.filter(
    (k) => k.from_date <= today && k.to_date >= today
  );
  const eigeneMeldung = aktuellKrank.find((k) => k.fachkraft_id === profile?.id) ?? null;

  return { krankmeldungen, aktuellKrank, eigeneMeldung, loading, melden, zurueckziehen };
}
