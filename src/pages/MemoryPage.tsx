import { useState } from "react";
import { Brain, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemory } from "@/hooks/use-memory";
import { toast } from "sonner";

const CATEGORIES = ["identity", "profession", "project", "preference", "goal", "skill", "tool", "constraint", "general"];

export default function MemoryPage() {
  const { memories, loading, addMemory, deleteMemory, clearAll } = useMemory();
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");

  const handleAdd = async () => {
    const c = newContent.trim();
    if (!c) return;
    await addMemory(c, newCategory, 7);
    setNewContent("");
    toast.success("Memory saved");
  };

  const grouped = memories.reduce<Record<string, typeof memories>>((acc, m) => {
    (acc[m.category] = acc[m.category] || []).push(m);
    return acc;
  }, {});

  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-semibold">Memory Vault</h1>
          <Badge variant="secondary" className="ml-2">{memories.length}</Badge>
        </div>
        {memories.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Wipe all memories?")) clearAll(); }}>
            Clear all
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">How memory works</h3>
              <p className="text-sm text-muted-foreground">
                MegaKUMUL auto-learns durable facts about you from chats and uses them to personalize every response.
                Add facts manually below, or just chat — the system extracts the rest.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add a memory</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g. User is a backend engineer working on a fintech app in Go"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button onClick={handleAdd}>Save</Button>
          </div>
        </Card>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {!loading && memories.length === 0 && (
          <Card className="p-8 text-center">
            <Brain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No memories yet. Chat with MegaKUMUL and they'll appear here.</p>
          </Card>
        )}

        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{cat}</h3>
            <div className="space-y-2">
              {items.map((m) => (
                <Card key={m.id} className="p-3 flex items-start justify-between gap-3 group">
                  <div className="flex-1">
                    <p className="text-sm">{m.content}</p>
                    <div className="flex gap-2 mt-1.5 items-center">
                      <Badge variant="outline" className="text-xs">importance {m.importance}</Badge>
                      {m.source && <span className="text-xs text-muted-foreground">via {m.source}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMemory(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
