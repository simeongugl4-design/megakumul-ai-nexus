import { motion } from "framer-motion";
import { MessageSquare, Search, Code, FileText, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { useState } from "react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Conversational intelligence powered by advanced AI models",
    url: "/chat",
  },
  {
    icon: Search,
    title: "Deep Research",
    desc: "Real-time web research with citations and sources",
    url: "/research",
  },
  {
    icon: Code,
    title: "Code Assistant",
    desc: "Generate, debug, and explain code in any language",
    url: "/code",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    desc: "Upload and chat with your documents and papers",
    url: "/documents",
  },
];

const stats = [
  { value: "5+", label: "AI Models" },
  { value: "100+", label: "Languages" },
  { value: "Real-time", label: "Research" },
  { value: "∞", label: "Possibilities" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState("creative");

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary glow-primary"
            >
              <Zap className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h1 className="mb-4 text-5xl font-heading font-bold leading-tight">
              <span className="gradient-text">MegaKUMUL</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              AI Research & Intelligence Platform — combining conversational AI, real-time research, code generation, and document intelligence in one powerful interface.
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all gradient-primary glow-primary text-primary-foreground hover:opacity-90"
            >
              Start Chatting <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="text-2xl font-heading font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feat, i) => (
              <motion.button
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => navigate(feat.url)}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:bg-surface-elevated"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
                  <feat.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
