import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Shield,
  Menu,
  Building,
  AlertTriangle,
  Database,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavigationItems = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  // {
  //   title: "System Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  // },
  // {
  //   title: "Audit Logs",
  //   href: "/admin/logs",
  //   icon: FileText,
  // },
  // {
  //   title: "Departments",
  //   href: "/admin/departments",
  //   icon: Building,
  // },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-border">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-950 w-full rounded-md flex items-center justify-center">
            <img
              src="/public/assets/logo.svg"
              className="w-24 h-12"
              alt="TAQA Morocco logo"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-blue-950">
              TAQA Morocco
            </h1>
            <p className="text-xs text-red-600 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {/* Back to Main App */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main App
          </Link>

          {adminNavigationItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === "/admin" && location.pathname === "/admin");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 h-auto hover:bg-accent"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-red-100 text-red-600">
                    {user ? getUserInitials(user.full_name) : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {user?.full_name || "Unknown User"}
                  </p>
                  <p className="text-xs text-red-600 font-medium capitalize">
                    {user?.role || "No Role"} - Admin
                  </p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Admin Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card">
        <NavigationContent />
      </aside>

      {/* Mobile Navigation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-40">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          {/* Admin Header Bar */}
          <div className="bg-red-600 text-white px-6 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Administrator Panel</span>
              </div>
              <div className="flex items-center gap-2 text-red-100">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Elevated Privileges Active</span>
              </div>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
