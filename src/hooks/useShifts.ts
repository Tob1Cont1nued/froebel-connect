import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface ShiftItem {
  id: string;
  date: string;
  profile_id: string;
  profile_name: string;
  profile_initials: string;
  profile_avatar_url: string | null;
  start_time: string;
  end_time: string;
  note: string | null;
}

function toInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function useShifts(weekStart: Date) {
  const { session } = useAuth();
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fromStr = weekStart.toISOString().split('T')[0];
  const toDate = new Date(weekStart);
  toDate.setDate(toDate.getDate() + 4); // Mon–Fri
  const toStr = toDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('shifts')
      .select('id, date, profile_id, start_time, end_time, note, profiles(name, avatar_url)')
      .gte('date', fromStr)
      .lte('date', toStr)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        setShifts(
          (data ?? []).map((s) => ({
            id: s.id,
            date: s.date,
            profile_id: s.profile_id,
            profile_name: s.profiles?.name ?? 'Unbekannt',
            profile_initials: toInitials(s.profiles?.name ?? 'XX'),
            profile_avatar_url: s.profiles?.avatar_url ?? null,
            start_time: s.start_time.slice(0, 5),
            end_time: s.end_time.slice(0, 5),
            note: s.note,
          }))
        );
        setLoading(false);
      });
  }, [session?.user.id, fromStr]);

  return { shifts, loading };
}
