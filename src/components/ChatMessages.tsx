import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/lib/types";
import { Zap } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary glow-primary"
        >
          <Zap className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="mb-2 text-2xl font-heading font-bold gradient-text">
            Welcome to MegaKUMUL
          </h2>
          <p className="max-w-md text-muted-foreground">
            Your AI research & intelligence platform. Ask anything, research deeply, generate code, and more.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {[
            "Explain quantum computing in simple terms",
            "Write a Python web scraper",
            "Compare React vs Vue vs Svelte",
            "Summarize the latest AI research trends",
          ].map((prompt) => (
            <button
              key={prompt}
              className="rounded-xl border border-border bg-card p-4 text-left text-sm text-muted-foreground transition-all hover:border-primary/50 hover:bg-surface-elevated hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      <div className="mx-auto max-w-3xl space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary glow-primary">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-headings:font-heading prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary glow-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-primary typing-dot" />
              <span className="h-2 w-2 rounded-full bg-primary typing-dot" />
              <span className="h-2 w-2 rounded-full bg-primary typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
