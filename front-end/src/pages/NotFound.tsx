import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="w-16 h-16 bg-safety-warning/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-safety-warning" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">404</h1>
            <h2 className="text-xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
