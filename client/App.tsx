import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Team from "./pages/Team";
import TeamMembers from "./pages/TeamMembers";
import Distributor from "./pages/Distributor";
import Inbox from "./pages/Inbox";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import SalesTracker from "./pages/SalesTracker";
import Chat from "./pages/Chat";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "admin" | "member";
}) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Team management moved into Settings; separate Team Members page available */}
              <Route
                path="/distributor"
                element={
                  <RequireAuth role="admin">
                    <Distributor />
                  </RequireAuth>
                }
              />
              <Route
                path="/jobs"
                element={
                  <RequireAuth role="admin">
                    <Jobs />
                  </RequireAuth>
                }
              />
              <Route
                path="/chat"
                element={
                  <RequireAuth>
                    <Chat />
                  </RequireAuth>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <RequireAuth>
                    <Chat />
                  </RequireAuth>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <RequireAuth role="admin">
                    <JobDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
              <Route
                path="/inbox"
                element={
                  <RequireAuth>
                    <Inbox />
                  </RequireAuth>
                }
              />
              <Route
                path="/members"
                element={
                  <RequireAuth>
                    <TeamMembers />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route
                path="/sales-tracker"
                element={
                  <RequireAuth>
                    <SalesTracker />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
