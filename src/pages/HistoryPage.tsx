import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Search, Trash2, MessageSquare, BookOpen, Code, FileText, Calculator } from "lucide-react";
import { TopNav } from "@/components/TopNav";

type HistoryEntry = {
  id: string;
  query: string;
  source: string;
  icon: typeof MessageSquare;
  timestamp: Date;
};

const sourceIcons: Record<string, typeof MessageSquare> = {
  Chat: MessageSquare,
  Research: BookOpen,
  Code: Code,
  Documents: FileText,
  Math: Calculator,
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");

  const deleteEntry = (id: string) => setHistory((prev) => prev.filter((h) => h.id !== id));
  const clearAll = () => setHistory([]);

  const filtered = history.filter(
    (h) => h.query.toLowerCase().includes(search.toLowerCase()) || h.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold gradient-text">History</h1>
              <p className="text-sm text-muted-foreground">Your past queries and conversations</p>
            </div>
            {history.length > 0 && (
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear All</button>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 mb-6">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{history.length === 0 ? "No history yet. Start using MegaKUMUL to see your queries here!" : "No matching history entries."}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((entry, i) => {
                const Icon = entry.icon;
                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 group hover:bg-surface-elevated transition-colors">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{entry.query}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-primary">{entry.source}</span>
                        <span className="text-[10px] text-muted-foreground">{entry.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
