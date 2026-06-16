import { useState, useCallback } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { ToolsPanel } from "@/components/ToolsPanel";
import { TopNav } from "@/components/TopNav";
import { getExpert } from "@/lib/experts";

export default function ChatPage() {
  const {
    messages,
    isLoading,
    sendMessage,
    selectedModel,
    setSelectedModel,
    selectedExpert,
    setSelectedExpert,
  } = useChat();
  const [inputPrefill, setInputPrefill] = useState("");
  const [prefillKey, setPrefillKey] = useState(0);

  const handleToolClick = useCallback((prefix: string) => {
    setInputPrefill(prefix);
    setPrefillKey((k) => k + 1);
  }, []);

  const handleFollowUp = useCallback((prefix: string) => {
    sendMessage(prefix);
  }, [sendMessage]);

  const expert = getExpert(selectedExpert);

  return (
    <div className="flex h-screen flex-col">
      <TopNav
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedExpert={selectedExpert}
        onExpertChange={setSelectedExpert}
      />
      {expert.id !== "general" && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <span className="text-base">{expert.icon}</span>
          <span className="font-medium text-foreground">{expert.name}</span>
          <span className="opacity-70">— {expert.tagline}</span>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <ChatMessages messages={messages} isLoading={isLoading} onSend={handleFollowUp} />
          <ChatInput
            key={prefillKey}
            onSend={sendMessage}
            isLoading={isLoading}
            prefill={inputPrefill}
            onPrefillUsed={() => setInputPrefill("")}
          />
        </div>
        <ToolsPanel onToolClick={handleToolClick} />
      </div>
    </div>
  );
}
