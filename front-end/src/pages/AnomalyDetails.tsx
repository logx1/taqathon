import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  Save,
  Calendar,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  MessageSquare,
  FileText,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { getMaintenanceWindows } from "@/services/maintenanceWindow";
import { editAnomaly, getAnomaly } from "@/services/anomalies";

interface EnhancedAnomaly {
  id: string;
  equipmentNumber: string;
  systemId: string;
  anomalyDescription: string;
  detectionDate: Date;
  equipmentDescription: string;
  sectionProprietaire: string;
  fiabiliteIntegrite: number;
  disponibilite: number;
  processSafety: number;
  criticite: number;
  maintenanceShutdown: boolean;
  maintenanceDays?: number;
  linkedMaintenanceWindow?: string;
  status: "open" | "in-progress" | "resolved" | "archived";
  reportedBy: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  priority: "low" | "medium" | "high" | "critical";
  estimatedCost?: number;
  actualCost?: number;
  resolution?: string;
  preventiveActions?: string[];
}

const AnomalyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = React.useState(false);

  // Mock data - in real app this would come from API
  const [anomaly, setAnomaly] = React.useState<EnhancedAnomaly>(null);
  React.useEffect(() => {
    console.log(id);
    getAnomaly(id).then(resp => {
      console.log(resp);
      setAnomaly(resp.data)
      getMaintenanceWindows().then(res => {
        console.log(res);
        setMaintenanceWindows(res.data)
      })
    })
  }, [])
  const [maintenanceWindows, setMaintenanceWindows] = React.useState([]);
  React.useEffect(() => {
    getMaintenanceWindows().then(res => {
      console.log(res);
      setMaintenanceWindows(res.data)
    })
  }, [])
  const handleSave = async () => {
    // Recalculate criticite
    const newCriticite =
    anomaly.integrite +
    anomaly.disponibilite +
    anomaly.process_safety;
    
    const updatedAnomaly = {
      ...anomaly,
      criticite: newCriticite
    };
    const res = await editAnomaly(anomaly.id, updatedAnomaly)
    console.log(res);
    setAnomaly(anomaly);
    setIsEditing(false);

    toast({
      title: t("anomalyDetails.updated"),
      description: t("anomalyDetails.updatedSuccess"),
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setAnomaly((prev) => ({ ...prev, status: newStatus as any }));
    toast({
      title: t("anomalyDetails.statusUpdated"),
      description: `Anomaly status changed to ${newStatus.replace("-", " ")}`,
    });
  }; const getDuration = (start_date: Date, end_date: Date) => {
    return differenceInDays(end_date, start_date) + 1;
  };
  const getCriticalityColor = (criticite: number) => {
    if (criticite >= 12) return "bg-red-100 text-red-800";
    if (criticite >= 8) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getCriticalityLevel = (criticite: number) => {
    if (criticite >= 12) return "High";
    if (criticite >= 8) return "Medium";
    return "Low";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!anomaly) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Anomaly Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The requested anomaly could not be found.
          </p>
          <Button asChild className="mt-4">
            <Link to="/list">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return anomaly && (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/list")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("anomalyDetails.title")} {anomaly.num_equipement}
            </h1>
            <p className="text-muted-foreground">
              {anomaly.equipement_description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("common.saveChanges")}
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">
            {t("anomalyDetails.tabs.details")}
          </TabsTrigger>
          {/* <TabsTrigger value="timeline">
            {t("anomalyDetails.tabs.timeline")}
          </TabsTrigger> */}
          <TabsTrigger value="maintenance">
            {t("anomalyDetails.tabs.maintenance")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t("anomalyDetails.equipmentInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Equipment Number</Label>
                    <Input
                      value={anomaly.num_equipement}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setAnomaly((prev) => ({
                          ...prev,
                          num_equipement: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>System ID</Label>
                    <Input
                      value={anomaly.systeme}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setAnomaly((prev) => ({
                          ...prev,
                          systeme: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Equipment Description</Label>
                  <Input
                    value={anomaly.equipement_description}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAnomaly((prev) => ({
                        ...prev,
                        equipement_description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Section Propriétaire</Label>
                  <Input
                    value={anomaly.section_proprietaire}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAnomaly((prev) => ({
                        ...prev,
                        section_proprietaire: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status and Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t("anomalyDetails.statusPriority")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("anomalyDetails.status")}</Label>
                    <Select
                      value={anomaly.status}
                      onValueChange={handleStatusChange}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(anomaly.status)}
                  >
                    {anomaly.status.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={getCriticalityColor(anomaly.criticite)}
                  >
                    Criticality: {getCriticalityLevel(anomaly.criticite)} (
                    {anomaly.criticite}/15)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anomaly Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("anomalyDetails.description")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={anomaly.description}
                disabled={!isEditing}
                onChange={(e) =>
                  setAnomaly((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Criticality Scores */}
          <Card>
            <CardHeader>
              <CardTitle>{t("anomalyDetails.criticalityAssessment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t("anomalyDetails.fiabiliteIntegrite")}</Label>
                  <Select
                    value={anomaly.integrite.toString()}
                    onValueChange={(value) =>
                      setAnomaly((prev) => ({
                        ...prev,
                        integrite: parseInt(value),
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("anomalyDetails.disponibilite")}</Label>
                  <Select
                    value={anomaly.disponibilite.toString()}
                    onValueChange={(value) =>
                      setAnomaly((prev) => ({
                        ...prev,
                        disponibilite: parseInt(value),
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("anomalyDetails.processSafety")}</Label>
                  <Select
                    value={anomaly.process_safety.toString()}
                    onValueChange={(value) =>
                      setAnomaly((prev) => ({
                        ...prev,
                        process_safety: parseInt(value),
                      }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm font-medium">
                  Total Criticality:{" "}
                  {anomaly.integrite +
                    anomaly.disponibilite +
                    anomaly.process_safety}
                  /15
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Automatically calculated as sum of the three criteria above
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Maintenance Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={anomaly.maintenance}
                  onChange={(e) =>
                    setAnomaly((prev) => ({
                      ...prev,
                      maintenance: e.target.checked,
                    }))
                  }
                  disabled={!isEditing}
                />
                <Label>Requires Maintenance Shutdown</Label>
              </div>

              {anomaly.maintenance && (
                <div className="space-y-4 ml-6">
                  <div>
                    <Label>Maintenance Duration (days)</Label>
                    <Input
                      type="number"
                      value={anomaly.maintenanceDuration || ""}
                      onChange={(e) =>
                        setAnomaly((prev) => ({
                          ...prev,
                          maintenanceDuration:
                            parseInt(e.target.value) || undefined,
                        }))
                      }
                      disabled={!isEditing}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div>
                    <Label>Linked Maintenance Window</Label>
                    <Select
                      value={anomaly.linkedMaintenanceWindow || ""}
                      onValueChange={(value) =>
                        setAnomaly((prev) => ({
                          ...prev,
                          linkedMaintenanceWindow: value || undefined,
                        }))
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance window" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceWindows
                              .filter(
                                (w) =>
                                  getDuration(w.start_date, w.end_date) >=
                                  (anomaly.maintenanceDuration || 0),
                              )
                              .map((window) => (
                                <SelectItem key={window.id} value={window.id}>
                                  {window.name} ({getDuration(window.start_date, window.end_date)} days)
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnomalyDetails;
