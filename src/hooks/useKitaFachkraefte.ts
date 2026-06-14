import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface FachkraftItem {
  id: string;
  name: string;
  initials: string;
}

function toInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function useKitaFachkraefte() {
  const { profile } = useAuth();
  const [fachkraefte, setFachkraefte] = useState<FachkraftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('profiles')
      .select('id, name')
      .eq('role', 'fachkraft')
      .eq('kita_id', profile.kita_id)
      .then(({ data }: { data: any[] | null }) => {
        setFachkraefte(
          (data ?? []).map((p) => ({ id: p.id, name: p.name, initials: toInitials(p.name) }))
        );
        setLoading(false);
      });
  }, [profile?.kita_id]);

  return { fachkraefte, loading };
}
