import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Image as ImageIcon, Plus } from "lucide-react";
import { useDiagramGenerator } from "@/hooks/use-diagram-generator";
import { Interactive3DViewer } from "@/components/Interactive3DViewer";

interface DiagramPanelProps {
  query: string;
  autoGenerate?: boolean;
}

export function DiagramPanel({ query, autoGenerate = false }: DiagramPanelProps) {
  const { imageUrl, text, isLoading, error, generate } = useDiagramGenerator();
  const [customPrompt, setCustomPrompt] = useState("");
  const [allImages, setAllImages] = useState<{ url: string; text: string; prompt: string }[]>([]);
  const lastAutoQuery = useRef("");

  // Track generated images
  useEffect(() => {
    if (imageUrl && !allImages.find(img => img.url === imageUrl)) {
      setAllImages(prev => [...prev, { url: imageUrl, text: text || "", prompt: customPrompt || query }]);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (autoGenerate && query && query !== lastAutoQuery.current) {
      lastAutoQuery.current = query;
      setAllImages([]);
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

  const handleGenerateMore = () => {
    const variations = [
      `Show a different perspective of: ${query}`,
      `Create a detailed cross-section diagram of: ${query}`,
      `Illustrate the process flow of: ${query}`,
      `Show the components and structure of: ${query}`,
    ];
    const nextPrompt = variations[allImages.length % variations.length];
    setCustomPrompt(nextPrompt);
    generate(nextPrompt);
  };

  return (
    <div className="space-y-4">
      {/* Generate button - shown when no images and not loading */}
      {allImages.length === 0 && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center"
        >
          <ImageIcon className="mx-auto h-8 w-8 text-primary/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">Generate AI diagrams for this topic</p>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Generating AI diagram...</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">⚠️ {error}</p>
          <button onClick={handleGenerate} className="mt-2 text-xs text-primary hover:underline">Try again</button>
        </div>
      )}

      {/* All generated images in a grid */}
      {allImages.length > 0 && (
        <div className="space-y-4">
          <div className={`grid gap-4 ${allImages.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
            {allImages.map((img, i) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Interactive3DViewer imageUrl={img.url} title={img.prompt} />
                {img.text && <p className="mt-1 text-xs text-muted-foreground text-center">{img.text}</p>}
              </motion.div>
            ))}
          </div>

          {/* Generate more button */}
          <div className="flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateMore}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-all disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate Another Diagram
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Regenerate
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
