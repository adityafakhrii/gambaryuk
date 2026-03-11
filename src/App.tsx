import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import AnimatedRoutes from "@/components/layout/AnimatedRoutes";
import { Walkthrough } from "@/components/Walkthrough";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { HelmetProvider } from 'react-helmet-async';
import { PWAReloadPrompt } from "@/components/PWAReloadPrompt";

const queryClient = new QueryClient();

function KeyboardShortcuts() {
  useKeyboardShortcuts();
  return null;
}

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <KeyboardShortcuts />
              <PWAReloadPrompt />
              <BrowserRouter>
                <SidebarProvider defaultOpen={true}>
                  <div className="min-h-screen flex w-full bg-background transition-colors">
                    <AppSidebar />
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden p-2 pl-0 gap-2">
                      <TopBar />
                      <main className="flex-1 overflow-auto bg-card rounded-2xl shadow-sm border border-border/50 relative p-4 md:p-6 lg:p-8">
                        <AnimatedRoutes />
                      </main>
                    </div>
                  </div>
                  <Walkthrough />
                </SidebarProvider>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;

