import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface TeamTodoItem {
  id: string;
  text: string;
  done: boolean;
  created_by: string;
  created_by_name: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  created_at: string;
}

export function useTeamTodos() {
  const { profile } = useAuth();
  const [todos, setTodos] = useState<TeamTodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.kita_id) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('team_todos')
      .select('*')
      .eq('kita_id', profile.kita_id)
      .order('done', { ascending: true })
      .order('created_at', { ascending: true });
    setTodos(data ?? []);
    setLoading(false);
  }, [profile?.kita_id]);

  useEffect(() => { load(); }, [load]);

  const add = async (text: string, assignedTo?: { id: string; name: string } | null) => {
    if (!profile?.kita_id || !text.trim()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('team_todos')
      .insert({
        kita_id: profile.kita_id,
        created_by: profile.id,
        created_by_name: profile.name ?? '',
        assigned_to: assignedTo?.id ?? null,
        assigned_to_name: assignedTo?.name ?? null,
        text: text.trim(),
      })
      .select()
      .single();
    if (data) setTodos((prev) => [data, ...prev]);
  };

  const toggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const done = !todo.done;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('team_todos').update({ done }).eq('id', id);
  };

  const claim = async (id: string) => {
    if (!profile) return;
    setTodos((prev) =>
      prev.map((t) => t.id === id ? { ...t, assigned_to: profile.id, assigned_to_name: profile.name ?? '' } : t)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('team_todos')
      .update({ assigned_to: profile.id, assigned_to_name: profile.name })
      .eq('id', id);
  };

  const remove = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('team_todos').delete().eq('id', id);
  };

  return { todos, loading, add, toggle, claim, remove };
}
