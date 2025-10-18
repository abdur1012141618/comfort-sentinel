import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGate } from "@/components/AuthGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FallCheck from "./pages/FallCheck";
import Falls from "./pages/Falls";
import Alerts from "./pages/Alerts";
import Residents from "./pages/Residents";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import DashboardLayout from "./components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/useAuthStore";

const queryClient = new QueryClient();

const App = () => {
  const { clearAuth } = useAuthStore();

  // Listen to auth state changes and clear store on logout
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      clearAuth();
      // Clear query cache on logout
      queryClient.clear();
    }
  });

  return (
    <ErrorBoundary>
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
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/residents" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Residents />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Alerts />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/logs" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Logs />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
