import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const authContext = useAuth();

  // Handle case where context might not be available yet
  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Shield className="w-8 h-8 text-primary-foreground animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TAQAMOROCCO</h1>
              <p className="text-gray-600">Initializing...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, isLoading } = authContext;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Shield className="w-8 h-8 text-primary-foreground animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TAQAMOROCCO</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
