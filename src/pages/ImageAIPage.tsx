import { useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ImageIcon, ArrowRight, Loader2, RotateCcw, Sparkles, Eye, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useImageAI } from "@/hooks/use-image-ai";
import { TopNav } from "@/components/TopNav";
import { FollowUpOptions } from "@/components/FollowUpOptions";

const actions = [
  { id: "generate", label: "Generate Image", icon: Sparkles, desc: "Create an AI image" },
  { id: "analyze", label: "Analyze Image", icon: Eye, desc: "Describe or analyze a visual" },
];

const suggestions = [
  "A futuristic cyberpunk cityscape at night with neon lights",
  "A majestic eagle soaring over snow-capped mountains at sunset",
  "A 3D render of a crystal ball containing a miniature galaxy",
  "A photorealistic robot hand holding a delicate flower",
];

export default function ImageAIPage() {
  const { content, imageUrl, isLoading, error, generate, clear } = useImageAI();
  const [input, setInput] = useState("");
  const [action, setAction] = useState("generate");
  const [selectedModel, setSelectedModel] = useState("creative");
  const [zoom, setZoom] = useState(1);
  const [allImages, setAllImages] = useState<{ url: string; prompt: string }[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    setZoom(1);
    generate(input.trim(), action);
  };

  // Track generated images
  const prevImageUrl = useRef<string | null>(null);
  if (imageUrl && imageUrl !== prevImageUrl.current) {
    prevImageUrl.current = imageUrl;
    if (!allImages.find(img => img.url === imageUrl)) {
      setAllImages(prev => [...prev, { url: imageUrl, prompt: input }]);
    }
  }

  const handleDownload = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `megakumul-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const hasResults = content.length > 0 || imageUrl || isLoading || allImages.length > 0;

  const followUpOptions = [
    { label: "Generate a variation of this image", query: `Create a variation of: ${input.slice(0, 60)}` },
    { label: "Make it more photorealistic", query: `Make this more photorealistic and detailed: ${input.slice(0, 60)}` },
    { label: "Change to a different art style", query: `Recreate in a completely different art style: ${input.slice(0, 60)}` },
    { label: "Add more detail and depth", query: `Add more intricate detail, depth and lighting to: ${input.slice(0, 60)}` },
    { label: "Create a panoramic version", query: `Create a wide panoramic version of: ${input.slice(0, 60)}` },
    { label: "Generate the opposite scene", query: `Generate the opposite/contrasting scene of: ${input.slice(0, 60)}` },
  ];

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!hasResults ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 min-h-[calc(100vh-3.5rem)]">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(45,90%,55%)] shadow-[0_0_20px_hsl(45,90%,55%,0.3)]">
              <ImageIcon className="h-10 w-10 text-background" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center mb-8">
              <h1 className="text-4xl font-heading font-bold gradient-text mb-3">Image AI</h1>
              <p className="max-w-lg text-muted-foreground">Generate stunning 3D AI images or analyze visuals with advanced AI</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-3 mb-8">
              {actions.map((a) => (
                <button key={a.id} onClick={() => setAction(a.id)} className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${action === a.id ? "border-[hsl(45,90%,55%)] bg-[hsl(45,90%,55%)]/10 text-[hsl(45,90%,55%)]" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  <a.icon className="h-4 w-4" /> {a.label}
                </button>
              ))}
            </motion.div>

            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} onSubmit={handleSubmit} className="w-full max-w-2xl mb-8">
              <div className="rounded-2xl border border-border bg-card p-3 focus-within:border-[hsl(45,90%,55%)]/50">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={action === "analyze" ? "Describe the image you want analyzed..." : "Describe the image you want to generate in detail..."} rows={3} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }} />
                <div className="flex justify-end mt-2">
                  <button type="submit" disabled={!input.trim()} className="rounded-xl px-5 py-2 text-sm font-medium bg-[hsl(45,90%,55%)] text-background transition-all disabled:opacity-30 hover:opacity-90">
                    {action === "generate" ? "Generate" : "Analyze"} <ArrowRight className="inline h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </motion.form>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="w-full max-w-2xl">
              <p className="text-center text-sm text-muted-foreground mb-4 font-medium">Try these:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <motion.button key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }} whileHover={{ scale: 1.02 }} onClick={() => { setInput(s); setZoom(1); generate(s, action); }} className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left text-sm text-muted-foreground transition-all hover:border-[hsl(45,90%,55%)]/50 hover:text-foreground">
                    <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(45,90%,55%)] opacity-60 group-hover:opacity-100" />
                    <span className="line-clamp-2">{s}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-[hsl(45,90%,55%)]" />
                <span className="text-muted-foreground">Image AI</span>
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-[hsl(45,90%,55%)]" />}
              </div>
              <button onClick={() => { clear(); setInput(""); setZoom(1); setAllImages([]); prevImageUrl.current = null; }} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                <RotateCcw className="h-3 w-3" /> New
              </button>
            </div>

            {isLoading && !imageUrl && !content && (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[hsl(45,90%,55%)] mb-4" />
                <p className="text-sm text-muted-foreground">{action === "generate" ? "Generating your AI image..." : "Analyzing..."}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">This may take 10-20 seconds</p>
              </div>
            )}

            {/* All generated images grid */}
            {allImages.length > 0 && (
              <div className="mb-6">
                <div className={`grid gap-4 ${allImages.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                  {allImages.map((img, i) => (
                    <motion.div key={img.url} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">{img.prompt}</span>
                        <button onClick={() => handleDownload(img.url)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="overflow-auto max-h-[500px] bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
                        <img src={img.url} alt="AI Generated" className="rounded-lg max-w-full" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {content && !imageUrl && (
              <div className="rounded-2xl border border-border bg-card p-6 mb-6">
                {error ? <p className="text-destructive">⚠️ {error}</p> : (
                  <div className="prose prose-sm prose-invert max-w-none prose-headings:font-heading prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {error && !content && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center mb-6">
                <p className="text-destructive mb-2">⚠️ {error}</p>
                <button onClick={() => generate(input, action)} className="text-xs text-primary hover:underline">Try again</button>
              </div>
            )}

            {!isLoading && (allImages.length > 0 || content) && (
              <div className="mb-6">
                <FollowUpOptions
                  options={followUpOptions}
                  onSelect={(q) => { setInput(q); generate(q, action); }}
                  icon={ImageIcon}
                />
              </div>
            )}

            {!isLoading && (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                <ImageIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Generate another image..." rows={1} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} />
                <button type="submit" disabled={!input.trim()} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-[hsl(45,90%,55%)] text-background disabled:opacity-30">Go</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
