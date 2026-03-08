import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Trash2, Search, Copy, Check } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type SavedResponse = {
  id: string;
  title: string;
  content: string;
  source: string;
  savedAt: Date;
};

export default function SavedResponsesPage() {
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("fast");

  const deleteResponse = (id: string) => setResponses((prev) => prev.filter((r) => r.id !== id));

  const copyResponse = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = responses.filter(
    (r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold gradient-text">Saved Responses</h1>
            <p className="text-sm text-muted-foreground">Your bookmarked AI responses</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 mb-6">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search saved responses..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Star className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{responses.length === 0 ? "No saved responses yet. Star responses from chat to save them here!" : "No matching responses found."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((resp, i) => (
                <motion.div key={resp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded(expanded === resp.id ? null : resp.id)}>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground text-sm">{resp.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-primary">{resp.source}</span>
                        <span className="text-[10px] text-muted-foreground">{resp.savedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); copyResponse(resp.id, resp.content); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        {copiedId === resp.id ? <Check className="h-3.5 w-3.5 text-[hsl(150,80%,50%)]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteResponse(resp.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {expanded === resp.id && (
                    <div className="border-t border-border p-4">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{resp.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
