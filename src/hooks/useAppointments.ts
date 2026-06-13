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
    supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data }) => {
        setAppointments(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data as any[]) ?? []).map((a) => ({
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
