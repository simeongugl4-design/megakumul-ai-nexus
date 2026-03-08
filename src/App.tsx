import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ResearchPage from "./pages/ResearchPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-14 items-center border-b border-border bg-card px-4">
        <h1 className="font-heading font-semibold">{title}</h1>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-heading font-bold gradient-text">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/documents" element={<PlaceholderPage title="Document Intelligence" description="Coming soon — upload and chat with your documents" />} />
            <Route path="/image-ai" element={<PlaceholderPage title="Image AI" description="Coming soon — AI-powered image generation" />} />
            <Route path="/code" element={<PlaceholderPage title="Code Assistant" description="Coming soon — generate, debug, and explain code" />} />
            <Route path="/knowledge" element={<PlaceholderPage title="Knowledge Base" description="Coming soon — your personal knowledge graph" />} />
            <Route path="/saved" element={<PlaceholderPage title="Saved Responses" description="Coming soon — save and organize AI responses" />} />
            <Route path="/history" element={<PlaceholderPage title="History" description="Coming soon — browse your conversation history" />} />
            <Route path="/integrations" element={<PlaceholderPage title="Integrations" description="Coming soon — connect your favorite tools" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="Coming soon — customize your MegaKUMUL experience" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
