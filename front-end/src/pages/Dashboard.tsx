import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Users,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { getHighAnomalies, getOpenAnomalies, getTotalAnomalies } from "@/services/anomalies";

interface RecentActivity {
  id: string;
  type: "anomaly_reported" | "anomaly_resolved" | "maintenance_scheduled";
  title: string;
  description: string;
  timestamp: Date;
  severity?: "high" | "medium" | "low";
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  // Demo-friendly KPIs for 5-minute presentation
  const [kpis] = React.useState({
    totalAnomalies: 47,
    openAnomalies: 12,
    highCriticalityAnomalies: 3,
    maintenanceWindows: 5,
    resolvedThisWeek: 8,
    avgResolutionTime: 2.3, // days
    aiAgreementRate: 89.4, // AI-Human agreement rate
  });
  const [totalAnomalies, setTotalAnomalies] = React.useState(null);
  const [openAnomalies, setOpenAnomalies] = React.useState(null);
  const [highAnomalies, setHighAnomalies] = React.useState(null);
  React.useEffect(() => {
    getTotalAnomalies().then(res => setTotalAnomalies(res.data.total_anomalies))
    getOpenAnomalies().then(res => {
      setOpenAnomalies(res.data.anomalies.length)
    })
    getHighAnomalies().then(res => {
      setHighAnomalies(res.data.anomalies.length)
    })
  }, [])
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">
                {t("dashboard.totalAnomalies")}
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalAnomalies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">
                {t("dashboard.openAnomalies")}
              </div>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{openAnomalies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">
                {t("dashboard.highCriticality")}
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {highAnomalies}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.requireImmediateAttention")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t("dashboard.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-start h-auto p-4">
                <Link
                  to="/list"
                  className="flex flex-col items-start space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">
                      {t("dashboard.viewAllAnomalies")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-gray-200">
                    {t("dashboard.manageTrackStatus")}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Link
                  to="/anomaly-upload"
                  className="flex flex-col items-start space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">
                      {t("dashboard.uploadClassify")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-gray-200">
                    {t("dashboard.useAIPredictCriticality")}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Link
                  to="/maintenance-windows"
                  className="flex flex-col items-start space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {t("dashboard.maintenancePlanning")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-gray-200">
                    {t("dashboard.scheduleManageWindows")}
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
