import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  date: Date;
  icon: string;
  size: string | null;
  file_url: string | null;
}

export function useDocuments() {
  const { session } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDocuments(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data as any[]) ?? []).map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            date: new Date(d.created_at),
            icon: d.icon ?? '📄',
            size: d.size,
            file_url: d.file_url,
          }))
        );
        setLoading(false);
      });
  }, [session?.user.id]);

  return { documents, loading };
}
