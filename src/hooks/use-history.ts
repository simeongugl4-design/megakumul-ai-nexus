import { useState, useCallback, useEffect } from "react";

export type HistoryEntry = {
  id: string;
  query: string;
  source: "Chat" | "Research" | "Code" | "Documents" | "Math" | "Image";
  timestamp: string;
};

const STORAGE_KEY = "megakumul-history";
const MAX_ENTRIES = 200;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch { /* storage full */ }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addEntry = useCallback((query: string, source: HistoryEntry["source"]) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      query: query.slice(0, 300),
      source,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setHistory([]);
  }, []);

  const search = useCallback((term: string) => {
    const lower = term.toLowerCase();
    return history.filter(h =>
      h.query.toLowerCase().includes(lower) || h.source.toLowerCase().includes(lower)
    );
  }, [history]);

  return { history, addEntry, deleteEntry, clearAll, search };
}
