import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { useDiagramGenerator } from "@/hooks/use-diagram-generator";
import { Interactive3DViewer } from "@/components/Interactive3DViewer";

interface DiagramPanelProps {
  query: string;
  autoGenerate?: boolean;
}

export function DiagramPanel({ query, autoGenerate = false }: DiagramPanelProps) {
  const { imageUrl, text, isLoading, error, generate } = useDiagramGenerator();
  const [customPrompt, setCustomPrompt] = useState("");
  const lastAutoQuery = useRef("");

  // Auto-generate diagram when query changes and autoGenerate is true
  useEffect(() => {
    if (autoGenerate && query && query !== lastAutoQuery.current) {
      lastAutoQuery.current = query;
      generate(query);
    }
  }, [query, autoGenerate, generate]);

  const handleGenerate = () => {
    const prompt = customPrompt.trim() || query;
    if (prompt) {
      lastAutoQuery.current = prompt;
      generate(prompt);
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate button - shown when no image and not loading */}
      {!imageUrl && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center"
        >
          <ImageIcon className="mx-auto h-8 w-8 text-primary/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Generate an AI diagram for this topic
          </p>
          <div className="flex items-center gap-2 max-w-md mx-auto mb-3">
            <input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={query ? `Default: "${query.slice(0, 50)}..."` : "Describe the diagram..."}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium gradient-primary text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
            Generate Interactive Diagram
          </motion.button>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-border bg-card p-8 text-center"
        >
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Generating AI diagram...</p>
          <p className="text-xs text-muted-foreground/60 mt-1">This may take a few seconds</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">⚠️ {error}</p>
          <button
            onClick={handleGenerate}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* 3D Viewer with generated image */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Interactive3DViewer
            imageUrl={imageUrl}
            title={customPrompt || query}
          />
          {text && (
            <p className="mt-2 text-xs text-muted-foreground text-center">{text}</p>
          )}
          <div className="mt-3 text-center">
            <button
              onClick={handleGenerate}
              className="text-xs text-primary hover:underline"
            >
              Regenerate diagram
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
