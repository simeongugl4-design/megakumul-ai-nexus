import { useChat } from "@/hooks/use-chat";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { ToolsPanel } from "@/components/ToolsPanel";
import { TopNav } from "@/components/TopNav";

export default function ChatPage() {
  const { messages, isLoading, sendMessage, selectedModel, setSelectedModel } = useChat();

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
        <ToolsPanel />
      </div>
    </div>
  );
}
