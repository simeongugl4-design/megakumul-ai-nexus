import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface UserMemory {
  id: string;
  category: string;
  content: string;
  importance: number;
  source: string | null;
  created_at: string;
}

const EXTRACT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-memory`;

export function useMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMemories = useCallback(async () => {
    if (!user) { setMemories([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("user_memories")
      .select("*")
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) setMemories(data as UserMemory[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const addMemory = useCallback(async (content: string, category = "general", importance = 5) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_memories")
      .insert({ user_id: user.id, content, category, importance, source: "manual" })
      .select()
      .single();
    if (!error && data) setMemories((m) => [data as UserMemory, ...m]);
  }, [user]);

  const deleteMemory = useCallback(async (id: string) => {
    await supabase.from("user_memories").delete().eq("id", id);
    setMemories((m) => m.filter((x) => x.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    if (!user) return;
    await supabase.from("user_memories").delete().eq("user_id", user.id);
    setMemories([]);
  }, [user]);

  /** Extract durable facts from a chat turn and persist them. Silent on failure. */
  const captureFromChat = useCallback(async (userMessage: string, assistantMessage: string) => {
    if (!user) return;
    try {
      const resp = await fetch(EXTRACT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ userMessage, assistantMessage }),
      });
      if (!resp.ok) return;
      const { memories: extracted } = await resp.json();
      if (!Array.isArray(extracted) || extracted.length === 0) return;

      const rows = extracted.map((m: { category: string; content: string; importance: number }) => ({
        user_id: user.id,
        category: m.category,
        content: m.content,
        importance: m.importance,
        source: "chat",
      }));
      const { data } = await supabase.from("user_memories").insert(rows).select();
      if (data) setMemories((prev) => [...(data as UserMemory[]), ...prev]);
    } catch (e) {
      console.warn("memory capture failed", e);
    }
  }, [user]);

  /** Build a compact context string of top memories for system prompt injection. */
  const buildContext = useCallback((limit = 15): string => {
    if (memories.length === 0) return "";
    const top = memories.slice(0, limit);
    return `KNOWN FACTS ABOUT THE USER (from long-term memory; use to personalize responses, do not repeat verbatim):\n${
      top.map((m) => `- [${m.category}] ${m.content}`).join("\n")
    }`;
  }, [memories]);

  return { memories, loading, addMemory, deleteMemory, clearAll, captureFromChat, buildContext, refresh: fetchMemories };
}
