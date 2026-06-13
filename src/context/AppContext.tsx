import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface ConvItem {
  id: string;
  from: string;
  fromRole: string;
  avatar: string;
  preview: string;
  lastMessage: Date;
  unread: number;
}

interface AppContextType {
  conversations: ConvItem[];
  unreadCount: number;
  loading: boolean;
  sendMessage: (convId: string, text: string) => Promise<void>;
  markAsRead: (convId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const roleLabel: Record<string, string> = {
  fachkraft: 'Fachkraft',
  eltern: 'Elternteil',
  traeger: 'Träger',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);

  async function loadConversations() {
    if (!session) return;
    const userId = session.user.id;
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mineRaw } = await (supabase as any)
      .from('conversation_participants')
      .select('conversation_id, unread_count')
      .eq('profile_id', userId);
    const mine = (mineRaw ?? []) as Array<{ conversation_id: string; unread_count: number }>;

    if (mine.length === 0) { setLoading(false); return; }
    const convIds = mine.map((m) => m.conversation_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const [{ data: convsRaw }, { data: othersRaw }, { data: msgsRaw }] = await Promise.all([
      sb.from('conversations').select('id, subject, updated_at').in('id', convIds).order('updated_at', { ascending: false }),
      sb.from('conversation_participants').select('conversation_id, profiles(name, role)').in('conversation_id', convIds).neq('profile_id', userId),
      sb.from('messages').select('conversation_id, text, created_at').in('conversation_id', convIds).order('created_at', { ascending: false }),
    ]);

    const convs = (convsRaw ?? []) as Array<{ id: string; subject: string | null; updated_at: string }>;
    const others = (othersRaw ?? []) as Array<{ conversation_id: string; profiles: { name: string; role: string } | null }>;
    const msgs = (msgsRaw ?? []) as Array<{ conversation_id: string; text: string; created_at: string }>;

    const lastMsgMap = new Map<string, { text: string; created_at: string }>();
    for (const m of msgs) {
      if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m);
    }

    setConversations(
      convs.map((conv) => {
        const myPart = mine.find((m) => m.conversation_id === conv.id);
        const other = others.find((o) => o.conversation_id === conv.id);
        const otherProfile = other?.profiles ?? null;
        const lastMsg = lastMsgMap.get(conv.id);
        const fromName = otherProfile?.name ?? conv.subject ?? 'Kita-Team';
        return {
          id: conv.id,
          from: fromName,
          fromRole: roleLabel[otherProfile?.role ?? ''] ?? 'Kita',
          avatar: initials(fromName),
          preview: lastMsg?.text ?? conv.subject ?? '',
          lastMessage: new Date(lastMsg?.created_at ?? conv.updated_at),
          unread: myPart?.unread_count ?? 0,
        };
      })
    );
    setLoading(false);
  }

  useEffect(() => {
    if (session) loadConversations();
    else setConversations([]);
  }, [session?.user.id]);

  const sendMessage = async (convId: string, text: string) => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('messages').insert({ conversation_id: convId, sender_id: session.user.id, text });
    setConversations((prev) =>
      prev.map((c) => c.id === convId ? { ...c, preview: text, lastMessage: new Date() } : c)
    );
  };

  const markAsRead = async (convId: string) => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('conversation_participants').update({ unread_count: 0 }).eq('conversation_id', convId).eq('profile_id', session.user.id);
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, unread: 0 } : c));
  };

  return (
    <AppContext.Provider value={{ conversations, unreadCount, loading, sendMessage, markAsRead }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
