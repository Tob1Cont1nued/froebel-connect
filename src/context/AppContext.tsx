import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  conversations as initialConversations,
  absences as initialAbsences,
  type Conversation,
  type AbsenceEntry,
  type Role,
} from '../mockData';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  conversations: Conversation[];
  absences: AbsenceEntry[];
  unreadCount: number;
  sendMessage: (convId: string, text: string) => void;
  markAsRead: (convId: string) => void;
  addAbsence: (entry: Omit<AbsenceEntry, 'id'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('eltern');
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [absences, setAbsences] = useState<AbsenceEntry[]>(initialAbsences);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);

  const sendMessage = (convId: string, text: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msg = {
          id: String(Date.now()),
          sender: 'Ich',
          text,
          time: new Date(),
          isMe: true,
        };
        return { ...c, messages: [...c.messages, msg], preview: text, lastMessage: new Date() };
      })
    );
  };

  const markAsRead = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
    );
  };

  const addAbsence = (entry: Omit<AbsenceEntry, 'id'>) => {
    setAbsences((prev) => [{ ...entry, id: String(Date.now()) }, ...prev]);
  };

  return (
    <AppContext.Provider value={{ role, setRole, conversations, absences, unreadCount, sendMessage, markAsRead, addAbsence }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
