import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import Index from "./pages/Index";
import ResizePage from "./pages/ResizePage";
import CompressPage from "./pages/CompressPage";
import ConvertPage from "./pages/ConvertPage";
import CropPage from "./pages/CropPage";
import RotatePage from "./pages/RotatePage";
import WatermarkPage from "./pages/WatermarkPage";
import RemoveBgPage from "./pages/RemoveBgPage";
import FiltersPage from "./pages/FiltersPage";
import RenamePage from "./pages/RenamePage";
import CollagePage from "./pages/CollagePage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider defaultOpen={true}>
              <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <TopBar />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/resize" element={<ResizePage />} />
                      <Route path="/compress" element={<CompressPage />} />
                      <Route path="/convert" element={<ConvertPage />} />
                      <Route path="/crop" element={<CropPage />} />
                      <Route path="/rotate" element={<RotatePage />} />
                      <Route path="/watermark" element={<WatermarkPage />} />
                      <Route path="/remove-bg" element={<RemoveBgPage />} />
                      <Route path="/filters" element={<FiltersPage />} />
                      <Route path="/rename" element={<RenamePage />} />
                      <Route path="/collage" element={<CollagePage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
