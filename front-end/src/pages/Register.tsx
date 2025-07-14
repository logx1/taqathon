import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Mail,
  Lock,
  User,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Briefcase,
  Settings,
  HardHat,
} from "lucide-react";
import { UserRole } from "@/types/anomaly";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["operator", "engineer", "manager"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [registerError, setRegisterError] = React.useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "operator",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError("");
    console.log(data.role);
    
    const success = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });

    if (success) {
      toast({
        title: "Registration successful",
        description: "You can now login!",
      });
      navigate("/login");
    } else {
      console.log("here");
      setRegisterError("Email already exists. Please use a different email.");
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "operator":
        return <HardHat className="w-4 h-4" />;
      case "engineer":
        return <Settings className="w-4 h-4" />;
      case "manager":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "operator":
        return "Detect and report anomalies on the ground";
      case "engineer":
        return "Investigate, resolve, and document anomalies";
      case "manager":
        return "Oversee operations and track performance";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-full h-16 bg-blue-950 rounded-md flex items-center justify-center shadow-lg">
            <img
                src="/public/assets/logo.svg"
                className="w-24 h-12"
                alt="TAQA Morocco logo"
              />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              Join TAQA Morocco
            </h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              Create Account
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Fill in your details to create your TAQA Morocco account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {registerError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{registerError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-9"
                    {...form.register("name")}
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@company.com"
                    className="pl-9"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-9 pr-9"
                    {...form.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-9 pr-9"
                    {...form.register("confirmPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Role</Label>
                <RadioGroup
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue("role", value as UserRole)
                  }
                  className="space-y-3"
                >
                  {(["operator", "engineer", "manager"] as UserRole[]).map(
                    (role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <RadioGroupItem value={role} id={role} />
                        <Label
                          htmlFor={role}
                          className="cursor-pointer flex items-center gap-2 flex-1"
                        >
                          {getRoleIcon(role)}
                          <div>
                            <div className="font-medium capitalize">{role}</div>
                            <div className="text-xs text-muted-foreground">
                              {getRoleDescription(role)}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ),
                  )}
                </RadioGroup>
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded" />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 TAQAMOROCCO. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
