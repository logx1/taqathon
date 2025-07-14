import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { loginHandler, isLoading } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError("");
    const res = await loginHandler(data.email, data.password);
    if (!res)
      setLoginError("Invalid email or password. Please try again.");
    else if (res) {
      toast({
        title: "Login successful",
        description: "Welcome back to TAQAMOROCCO!",
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-950 rounded-xl flex items-center justify-center mb-6">
            <img
              src="/public/assets/logo.svg"
              className="w-12 h-8"
              alt="TAQA Morocco logo"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            TAQA Morocco
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Anomaly Management System
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {t("login.welcome")}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {t("login.subtitle")}
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {loginError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Authentication Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{loginError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">{t("login.email")}</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={cn(
                      "pl-10",
                      form.formState.errors.email && "border-red-300",
                    )}
                    placeholder={t("login.emailPlaceholder")}
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">{t("login.password")}</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={cn(
                      "pl-10 pr-10",
                      form.formState.errors.password && "border-red-300",
                    )}
                    placeholder={t("login.passwordPlaceholder")}
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("login.signIn")}...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("login.signIn")}
                    </div>
                  )}
                </Button>
              </div>

              {/* Language Selector */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-3">
                    Language / Langue
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant={language === "en" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLanguage("en")}
                      className="px-4 py-2 text-xs"
                    >
                      English
                    </Button>
                    <Button
                      type="button"
                      variant={language === "fr" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLanguage("fr")}
                      className="px-4 py-2 text-xs"
                    >
                      Français
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
