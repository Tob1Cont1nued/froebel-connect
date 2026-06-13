import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface MessageItem {
  id: string;
  text: string;
  time: Date;
  isMe: boolean;
  sender: string;
}

export function useMessages(convId: string | undefined) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  function fetchMessages() {
    if (!convId || !session) return;
    supabase
      .from('messages')
      .select('id, text, created_at, sender_id, profiles(name)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        setMessages(
          ((data as any[]) ?? []).map((m) => ({
            id: m.id,
            text: m.text,
            time: new Date(m.created_at),
            isMe: m.sender_id === session.user.id,
            sender: m.profiles?.name ?? 'Unbekannt',
          }))
        );
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!convId || !session) return;
    setLoading(true);
    setMessages([]);

    fetchMessages();

    // Real-time subscription (unzuverlässig auf Free Tier)
    channelRef.current = supabase
      .channel(`conv-${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = payload.new as any;
          setMessages((prev) => {
            if (prev.find((msg) => msg.id === m.id)) return prev;
            return [...prev, { id: m.id, text: m.text, time: new Date(m.created_at), isMe: m.sender_id === session.user.id, sender: '' }];
          });
        }
      )
      .subscribe();

    // Polling als Fallback alle 5 Sekunden
    const interval = setInterval(fetchMessages, 5000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      clearInterval(interval);
    };
  }, [convId, session?.user.id]);

  return { messages, loading, refetch: fetchMessages };
}
