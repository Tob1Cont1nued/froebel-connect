import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  created_at: string;
}

export function useTodos() {
  const { profile } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('todos')
      .select('id, text, done, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: true });
    setTodos(data ?? []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const add = async (text: string) => {
    if (!profile?.id || !text.trim()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('todos')
      .insert({ profile_id: profile.id, kita_id: profile.kita_id ?? null, text: text.trim() })
      .select()
      .single();
    if (data) setTodos((prev) => [...prev, data]);
  };

  const toggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const done = !todo.done;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('todos').update({ done }).eq('id', id);
  };

  const remove = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('todos').delete().eq('id', id);
  };

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return { todos, open, done, loading, add, toggle, remove };
}
