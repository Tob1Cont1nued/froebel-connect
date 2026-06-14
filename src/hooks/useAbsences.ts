import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface AbsenceItem {
  id: string;
  childId: string;
  from: Date;
  to: Date;
  reason: string;
  note: string | null;
  status: 'pending' | 'confirmed';
  childName: string | null;
  childEmoji: string | null;
  childPhotoUrl: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toItem(a: any): AbsenceItem {
  return {
    id: a.id,
    childId: a.child_id,
    from: new Date(a.from_date),
    to: new Date(a.to_date),
    reason: a.reason,
    note: a.note,
    status: a.status,
    childName: a.children?.name ?? null,
    childEmoji: a.children?.emoji ?? null,
    childPhotoUrl: a.children?.photo_url ?? null,
  };
}

export function useAbsences() {
  const { session } = useAuth();
  const [absences, setAbsences] = useState<AbsenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('absences').select('*, children(name, emoji, photo_url)').order('from_date', { ascending: true });
    setAbsences(((data as any[]) ?? []).map(toItem));
    setLoading(false);
  }

  useEffect(() => { load(); }, [session?.user.id]);

  const addAbsence = async (entry: { childId: string; from: Date; to: Date; reason: string; note?: string }) => {
    if (!session) return;
    const payload = {
      child_id: entry.childId,
      parent_id: session.user.id,
      from_date: entry.from.toISOString().split('T')[0],
      to_date: entry.to.toISOString().split('T')[0],
      reason: entry.reason,
      note: entry.note ?? null,
      status: 'pending' as const,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await supabase.from('absences').insert(payload as any).select('*').single();
    if (data) setAbsences((prev) => [toItem(data), ...prev]);
  };

  return { absences, loading, addAbsence };
}
