import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import FallCheck from "./pages/FallCheck";
import Falls from "./pages/Falls";
import Alerts from "./pages/Alerts";
import Residents from "./pages/Residents";
import Tasks from "./pages/Tasks";
import Vitals from "./pages/Vitals";
import Incidents from "./pages/Incidents";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                <Route path="/vitals" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Vitals />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Tasks />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/incidents" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Incidents />
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
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
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
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
