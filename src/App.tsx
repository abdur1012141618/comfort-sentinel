import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGate } from "@/components/AuthGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FallCheck from "./pages/FallCheck";
import Falls from "./pages/Falls";
import Alerts from "./pages/Alerts";
import Residents from "./pages/Residents";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  // Listen to auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    // Optional: Add any global auth state handling here
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <AuthGate>
                  <Index />
                </AuthGate>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/fall-check" element={
                <ProtectedRoute>
                  <FallCheck />
                </ProtectedRoute>
              } />
              <Route path="/falls" element={
                <ProtectedRoute>
                  <Falls />
                </ProtectedRoute>
              } />
              <Route path="/residents" element={
                <ProtectedRoute>
                  <Residents />
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
