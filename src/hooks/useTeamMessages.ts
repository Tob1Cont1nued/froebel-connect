import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface TeamMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

export function useTeamMessages() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    if (!profile?.kita_id) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('team_messages')
      .select('*')
      .eq('kita_id', profile.kita_id)
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages(data ?? []);
    setLoading(false);
  }, [profile?.kita_id]);

  useEffect(() => {
    load();
    if (!profile?.kita_id) return;

    // Realtime subscription (best-effort — requires table in realtime publication)
    const channel = supabase
      .channel(`team_messages:${profile.kita_id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `kita_id=eq.${profile.kita_id}` },
        (payload) => {
          const incoming = payload.new as TeamMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Polling fallback every 8s in case realtime is not configured on this table
    const poll = setInterval(load, 8000);

    return () => {
      channel.unsubscribe();
      clearInterval(poll);
    };
  }, [load, profile?.kita_id]);

  const send = async (message: string) => {
    if (!profile?.kita_id || !message.trim()) return;
    // Optimistic insert
    const optimistic: TeamMessage = {
      id: `opt-${Date.now()}`,
      sender_id: profile.id,
      sender_name: profile.name ?? '',
      message: message.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('team_messages').insert({
      kita_id: profile.kita_id,
      sender_id: profile.id,
      sender_name: profile.name,
      message: message.trim(),
    });
    // Reload to replace optimistic entry with real DB row
    await load();
  };

  return { messages, loading, send };
}
