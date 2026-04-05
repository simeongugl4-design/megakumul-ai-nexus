import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Image as ImageIcon, Plus, LayoutGrid } from "lucide-react";
import { useDiagramGenerator } from "@/hooks/use-diagram-generator";
import { Interactive3DViewer } from "@/components/Interactive3DViewer";

interface DiagramPanelProps {
  query: string;
  autoGenerate?: boolean;
}

function extractLabels(query: string): { text: string; position: [number, number, number]; color: string }[] {
  const topic = query.slice(0, 50).trim();
  const colors = ["#00d4ff", "#a855f7", "#22c55e", "#f59e0b"];
  
  // Generate contextual labels based on the topic
  const labels: { text: string; position: [number, number, number]; color: string }[] = [
    { text: "📊 " + (topic.length > 35 ? topic.slice(0, 35) + "…" : topic), position: [0, 2.8, 0], color: colors[0] },
  ];

  // Add subject area label
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("math") || lowerQuery.includes("equation") || lowerQuery.includes("integral") || lowerQuery.includes("calcul")) {
    labels.push({ text: "📐 Mathematical Visualization", position: [-2, -2.8, 0], color: colors[1] });
  } else if (lowerQuery.includes("code") || lowerQuery.includes("program") || lowerQuery.includes("algorithm")) {
    labels.push({ text: "💻 Code Architecture", position: [-2, -2.8, 0], color: colors[2] });
  } else if (lowerQuery.includes("science") || lowerQuery.includes("physics") || lowerQuery.includes("chem") || lowerQuery.includes("bio")) {
    labels.push({ text: "🔬 Scientific Diagram", position: [-2, -2.8, 0], color: colors[1] });
  } else if (lowerQuery.includes("research") || lowerQuery.includes("study") || lowerQuery.includes("analysis")) {
    labels.push({ text: "📖 Research Visual", position: [-2, -2.8, 0], color: colors[3] });
  } else {
    labels.push({ text: "🎯 AI Visual Analysis", position: [-2, -2.8, 0], color: colors[1] });
  }

  labels.push({ text: "MegaKUMUL AI", position: [2.2, -2.8, 0], color: "#666" });

  return labels;
}

export function DiagramPanel({ query, autoGenerate = false }: DiagramPanelProps) {
  const { imageUrl, text, isLoading, error, generate } = useDiagramGenerator();
  const [customPrompt, setCustomPrompt] = useState("");
  const [allImages, setAllImages] = useState<{ url: string; text: string; prompt: string }[]>([]);
  const lastAutoQuery = useRef("");

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
      `Create a detailed cross-section diagram with clear labels of: ${query}`,
      `Illustrate the step-by-step process flow of: ${query}`,
      `Show the components and internal structure of: ${query}`,
      `Create an annotated comparison diagram of: ${query}`,
    ];
    const nextPrompt = variations[allImages.length % variations.length];
    setCustomPrompt(nextPrompt);
    generate(nextPrompt);
  };

  const labels = extractLabels(query);

  return (
    <div className="space-y-4">
      {/* Generate button - shown when no images and not loading */}
      {allImages.length === 0 && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 text-center"
        >
          <div className="flex justify-center mb-3">
            <div className="relative">
              <ImageIcon className="h-10 w-10 text-primary/40" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-secondary animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Generate 3D AI Diagram</p>
          <p className="text-xs text-muted-foreground mb-4">Create a labeled, photorealistic visualization for this topic</p>
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
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            Generate Interactive Diagram
          </motion.button>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 text-center">
          <div className="relative inline-block mb-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary/20 animate-ping" />
          </div>
          <p className="text-sm font-medium text-foreground">Generating AI Diagram...</p>
          <p className="text-xs text-muted-foreground mt-1">Creating a labeled 3D visualization</p>
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
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Visual Diagrams</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{allImages.length}</span>
          </div>
          
          <div className={`grid gap-4 ${allImages.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
            {allImages.map((img, i) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Interactive3DViewer 
                  imageUrl={img.url} 
                  title={img.prompt.slice(0, 60)} 
                  labels={labels}
                />
                {img.text && (
                  <div className="mt-2 rounded-lg bg-muted/50 border border-border p-2">
                    <p className="text-xs text-muted-foreground text-center">{img.text}</p>
                  </div>
                )}
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
              Generate Another View
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
