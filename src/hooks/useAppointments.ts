import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface AppointmentItem {
  id: string;
  title: string;
  date: Date;
  time: string | null;
  type: 'event' | 'closure' | 'meeting' | 'info';
  description: string | null;
}

export function useAppointments() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('appointments')
      .select('*')
      .or(`parent_id.is.null,parent_id.eq.${session.user.id}`)
      .order('date', { ascending: true })
      .then(({ data }: { data: any[] | null }) => {
        setAppointments(
          (data ?? []).map((a) => ({
            id: a.id,
            title: a.title,
            date: new Date(a.date),
            time: a.time,
            type: a.type as AppointmentItem['type'],
            description: a.description,
          }))
        );
        setLoading(false);
      });
  }, [session?.user.id]);

  return { appointments, loading };
}
