import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ResearchPage from "./pages/ResearchPage";
import DocumentsPage from "./pages/DocumentsPage";
import ImageAIPage from "./pages/ImageAIPage";
import CodeAssistantPage from "./pages/CodeAssistantPage";
import MathSolverPage from "./pages/MathSolverPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import SavedResponsesPage from "./pages/SavedResponsesPage";
import HistoryPage from "./pages/HistoryPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import PricingPage from "./pages/PricingPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Temporarily bypassing auth for testing - remove this later
  return <AppLayout>{children}</AppLayout>;
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
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/research" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/image-ai" element={<ProtectedRoute><ImageAIPage /></ProtectedRoute>} />
            <Route path="/code" element={<ProtectedRoute><CodeAssistantPage /></ProtectedRoute>} />
            <Route path="/math" element={<ProtectedRoute><MathSolverPage /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedResponsesPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
