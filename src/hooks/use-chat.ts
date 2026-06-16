import { useState, useCallback } from "react";
import { Message } from "@/lib/types";
import { streamChat } from "@/lib/chat-api";
import { useHistory } from "@/hooks/use-history";
import { useMemory } from "@/hooks/use-memory";
import { getExpert } from "@/lib/experts";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("creative");
  const [selectedExpert, setSelectedExpertState] = useState<string>(() => {
    if (typeof window === "undefined") return "general";
    return localStorage.getItem("mk_expert") || "general";
  });
  const { addEntry } = useHistory();
  const { buildContext, captureFromChat } = useMemory();

  const setSelectedExpert = useCallback((id: string) => {
    setSelectedExpertState(id);
    try { localStorage.setItem("mk_expert", id); } catch { /* ignore */ }
    const exp = getExpert(id);
    if (exp.suggestedModel) setSelectedModel(exp.suggestedModel);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const expert = getExpert(selectedExpert);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    addEntry(content, "Chat");

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    const allMessages = [...messages, userMsg];
    const memoryContext = buildContext();

    await streamChat({
      messages: allMessages,
      model: selectedModel,
      expertPrompt: expert.systemPrompt || undefined,
      expertName: expert.name,
      memoryContext: memoryContext || undefined,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === assistantId) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: assistantContent,
              timestamp: new Date(),
              model: selectedModel,
              expert: expert.id,
            },
          ];
        });
      },
      onDone: () => {
        setIsLoading(false);
        if (assistantContent.length > 30) {
          captureFromChat(content, assistantContent);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ ${error}`,
            timestamp: new Date(),
          },
        ]);
      },
    });
  }, [messages, selectedModel, selectedExpert, addEntry, buildContext, captureFromChat]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    selectedModel,
    setSelectedModel,
    selectedExpert,
    setSelectedExpert,
  };
}
