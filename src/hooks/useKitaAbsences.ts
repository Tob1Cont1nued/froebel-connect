import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface KitaAbsenceItem {
  id: string;
  child_id: string;
  child_name: string;
  child_emoji: string;
  from_date: string;
  to_date: string;
  reason: string;
  note: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  parent_name: string | null;
}

export function useKitaAbsences() {
  const { profile } = useAuth();
  const [absences, setAbsences] = useState<KitaAbsenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('absences')
      .select('id, child_id, from_date, to_date, reason, note, status, children!inner(name, emoji, kita_id), profiles(name)')
      .eq('children.kita_id', profile.kita_id)
      .order('created_at', { ascending: false });

    setAbsences(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((data as any[]) ?? []).map((a) => ({
        id: a.id,
        child_id: a.child_id,
        child_name: a.children?.name ?? 'Unbekannt',
        child_emoji: a.children?.emoji ?? '🌻',
        from_date: a.from_date,
        to_date: a.to_date,
        reason: a.reason,
        note: a.note,
        status: a.status,
        parent_name: a.profiles?.name ?? null,
      }))
    );
    setLoading(false);
  }

  const confirmAbsence = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('absences').update({ status: 'confirmed' }).eq('id', id);
    setAbsences((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'confirmed' } : a)));
  };

  useEffect(() => { load(); }, [profile?.kita_id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { absences, loading, confirmAbsence };
}
