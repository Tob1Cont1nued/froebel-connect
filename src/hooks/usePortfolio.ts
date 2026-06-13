import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface PortfolioItem {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  date: Date;
}

export function usePortfolio(childId?: string | null) {
  const { session } = useAuth();
  const [entries, setEntries] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !childId) { setLoading(false); return; }
    supabase
      .from('portfolio_entries')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEntries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data as any[]) ?? []).map((e) => ({
            id: e.id,
            emoji: e.emoji ?? '📚',
            title: e.title,
            description: e.description,
            date: new Date(e.created_at),
          }))
        );
        setLoading(false);
      });
  }, [session?.user.id, childId]);

  return { entries, loading };
}
