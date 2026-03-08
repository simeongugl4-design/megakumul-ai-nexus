import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Search, Trash2, ExternalLink, Tag } from "lucide-react";
import { TopNav } from "@/components/TopNav";

type KBEntry = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedModel, setSelectedModel] = useState("expert");

  const addEntry = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        content: newContent.trim(),
        tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
        createdAt: new Date(),
      },
      ...prev,
    ]);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setShowAdd(false);
  };

  const deleteEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold gradient-text">Knowledge Base</h1>
              <p className="text-sm text-muted-foreground">Save and organize your knowledge snippets</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Add Entry
            </motion.button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 mb-6">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search knowledge base..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>

          {/* Add form */}
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-primary/30 bg-card p-4 space-y-3">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Content..." rows={4} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
              <input value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="Tags (comma-separated)" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted">Cancel</button>
                <button onClick={addEntry} disabled={!newTitle.trim() || !newContent.trim()} className="px-4 py-2 text-xs rounded-lg gradient-primary text-primary-foreground disabled:opacity-30">Save</button>
              </div>
            </motion.div>
          )}

          {/* Entries */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{entries.length === 0 ? "No entries yet. Add your first knowledge snippet!" : "No matching entries found."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-4 group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-semibold text-foreground">{entry.title}</h3>
                    <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-auto">{entry.createdAt.toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
