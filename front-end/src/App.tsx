import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import AnomalyList from "./pages/AnomalyList";
import AnomalyDetails from "./pages/AnomalyDetails";
import AnomalyUpload from "./pages/AnomalyUpload";
import MaintenanceWindows from "./pages/MaintenanceWindows";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import AuditLogs from "./pages/admin/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <UserManagement />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <SystemSettings />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AuditLogs />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Protected Main App Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/list"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnomalyList />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/anomaly-upload"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnomalyUpload />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maintenance-windows"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MaintenanceWindows />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/anomaly/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnomalyDetails />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NotFound />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
