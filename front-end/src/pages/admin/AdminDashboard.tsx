import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  AlertTriangle,
  Activity,
  Server,
  TrendingUp,
  Shield,
  Settings,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const AdminDashboard: React.FC = () => {
  const { adminStats, refreshStats } = useAdmin();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    await refreshStats();
    setIsRefreshing(false);
  };

  const quickStats = [
    {
      title: "Total Users",
      value: adminStats.totalUsers,
      icon: Users,
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Anomalies",
      value: adminStats.totalAnomalies,
      icon: AlertTriangle,
      trend: "+5%",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Active Users",
      value: adminStats.activeUsers,
      icon: UserCheck,
      trend: "+8%",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Critical Issues",
      value: adminStats.criticalAnomalies,
      icon: Shield,
      trend: "-15%",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const systemMetrics = [
    {
      title: "System Uptime",
      value: adminStats.systemUptime,
      status: "excellent",
    },
    {
      title: "Storage Used",
      value: adminStats.storageUsed,
      status: "good",
    },
    {
      title: "Daily Active Users",
      value: adminStats.dailyActiveUsers,
      status: "good",
    },
    {
      title: "Weekly New Anomalies",
      value: adminStats.weeklyNewAnomalies,
      status: "warning",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "warning":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "good":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.full_name}. Here's your system overview.
            </p>
          </div>
          <Button
            onClick={handleRefreshStats}
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Refresh Stats
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.trend}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemMetrics.map((metric) => (
              <div
                key={metric.title}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    getStatusColor(metric.status),
                  )}
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Admin Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System settings updated</p>
                  <p className="text-xs text-muted-foreground">
                    15 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Critical anomaly reported
                  </p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Users className="h-5 w-5" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">View Anomalies</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Settings className="h-5 w-5" />
              <span className="text-sm">System Settings</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Database className="h-5 w-5" />
              <span className="text-sm">Audit Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage and Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Documents</span>
                <span>1.2 GB</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database</span>
                <span>0.8 GB</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Logs</span>
                <span>0.4 GB</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm font-medium">
                <span>Total Used</span>
                <span>2.4 GB / 10 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-xs text-muted-foreground">
                  Daily Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-xs text-muted-foreground">
                  Weekly Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">3.2</div>
                <div className="text-xs text-muted-foreground">Avg Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">7</div>
                <div className="text-xs text-muted-foreground">Reports/Day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
