import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Search, Trash2, MessageSquare, BookOpen, Code, FileText, Calculator, ImageIcon } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { useHistory, HistoryEntry } from "@/hooks/use-history";

const sourceIcons: Record<string, typeof MessageSquare> = {
  Chat: MessageSquare,
  Research: BookOpen,
  Code: Code,
  Documents: FileText,
  Math: Calculator,
  Image: ImageIcon,
};

const sourceColors: Record<string, string> = {
  Chat: "text-primary",
  Research: "text-secondary",
  Code: "text-[hsl(150,80%,50%)]",
  Documents: "text-[hsl(30,90%,55%)]",
  Math: "text-primary",
  Image: "text-[hsl(45,90%,55%)]",
};

export default function HistoryPage() {
  const { history, deleteEntry, clearAll } = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", "Chat", "Research", "Code", "Documents", "Math", "Image"];

  const filtered = history.filter((h) => {
    const matchesSearch = h.query.toLowerCase().includes(searchTerm.toLowerCase()) || h.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || h.source === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold gradient-text">History</h1>
              <p className="text-sm text-muted-foreground">
                {history.length} {history.length === 1 ? "query" : "queries"} tracked
              </p>
            </div>
            {history.length > 0 && (
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 mb-4">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search history..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === f ? "bg-primary/10 text-primary border border-primary/30" : "border border-border text-muted-foreground hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {history.length === 0
                  ? "No history yet. Start using MegaKUMUL to see your queries here!"
                  : "No matching history entries."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((entry, i) => {
                const Icon = sourceIcons[entry.source] || MessageSquare;
                const colorClass = sourceColors[entry.source] || "text-primary";
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 group hover:bg-[hsl(var(--surface-elevated))] transition-colors"
                  >
                    <Icon className={`h-4 w-4 ${colorClass} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{entry.query}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${colorClass}`}>{entry.source}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
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
