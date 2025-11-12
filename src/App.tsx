import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import { Navigation } from "@/components/Navigation";
import { GhostModeToggle } from "@/components/GhostModeToggle";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import Projects from "./pages/Projects";
import BNI from "./pages/BNI";
import Workbench from "./pages/Workbench";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import ResetPasswordForm from "@/components/ResetPasswordForm";

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
                  <GhostModeToggle />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/workbench" element={<Workbench />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/goals" element={<Goals />} />
                   <Route path="/bni" element={<BNI />} />
                   <Route path="/settings" element={<Settings />} />
                   <Route path="/admin" element={<Admin />} />
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
