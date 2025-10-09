import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import Goals from "./pages/Goals";
import NotFound from "./pages/NotFound";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import AdminPanel from "@/components/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/*" element={
              <AuthGate>
                <div className="flex min-h-screen w-full">
                  <Navigation />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </AuthGate>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
