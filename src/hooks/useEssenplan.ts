import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface EssenplanEintrag {
  id: string;
  date: string;
  mahlzeit: 'mittagessen' | 'vesper';
  gericht: string;
  beschreibung: string | null;
  created_by: string | null;
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function useEssenplan(weekStart: Date) {
  const { profile } = useAuth();
  const [eintraege, setEintraege] = useState<EssenplanEintrag[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStartStr = localDateStr(weekStart);
  const weekEndStr = localDateStr(addDays(weekStart, 4));

  const load = useCallback(async () => {
    if (!profile?.kita_id) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('essenplan')
      .select('*')
      .eq('kita_id', profile.kita_id)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr)
      .order('date')
      .order('mahlzeit');
    setEintraege((data ?? []) as EssenplanEintrag[]);
    setLoading(false);
  }, [profile?.kita_id, weekStartStr, weekEndStr]);

  useEffect(() => { load(); }, [load]);

  const upsert = async (
    date: string,
    mahlzeit: 'mittagessen' | 'vesper',
    gericht: string,
    beschreibung?: string,
  ) => {
    if (!profile?.kita_id || !gericht.trim()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('essenplan').upsert(
      {
        kita_id: profile.kita_id,
        date,
        mahlzeit,
        gericht: gericht.trim(),
        beschreibung: beschreibung?.trim() || null,
        created_by: profile.id,
      },
      { onConflict: 'kita_id,date,mahlzeit' },
    );
    await load();
  };

  const remove = async (id: string) => {
    setEintraege((prev) => prev.filter((e) => e.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('essenplan').delete().eq('id', id);
  };

  return { eintraege, loading, upsert, remove, reload: load };
}

export { localDateStr, addDays };
