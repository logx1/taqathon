import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Brain,
  Target,
  Link,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Settings,
  Save,
  Clock,
  BarChart3,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { processAnomaly } from "@/services/anomalies";
import { getMaintenanceWindows } from "@/services/maintenanceWindow";

interface ProcessedAnomaly {
  id: string;
  equipmentNumber: string;
  systemId: string;
  description: string;
  equipmentDescription: string;
  sectionProprietaire: string;
  predictedFiabiliteIntegrite: number;
  predictedDisponibilite: number;
  predictedProcessSafety: number;
  predictedCriticite: number;
  confidence: number;
  explanation: string;
  requiresMaintenanceShutdown: boolean;
  suggestedMaintenanceDays?: number;
  suggestedMaintenanceWindow?: string;
  actionPlan?: string;
  userFeedback?: "correct" | "incorrect" | null;
  correctedScores?: {
    fiabiliteIntegrite: number;
    disponibilite: number;
    processSafety: number;
  };
}

interface MaintenanceWindow {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  capacity: number;
  assignedAnomalies: number;
}

const AnomalyUpload: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [processedAnomalies, setProcessedAnomalies] = React.useState<
    ProcessedAnomaly[]
  >([]);
  const [modelKPIs] = React.useState({
    predictionAccuracy: 94.2,
    f1Score: 0.91,
    criticalIssuesAutoFlagged: 8,
    totalPredictions: 47,
    correctPredictions: 44,
    userCorrections: 3,
    agreementRate: 89.4,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} is ready for processing`,
      });
    }
  };

  const processAnomalyFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate ML processing steps
    const steps = [
      "Reading anomaly data from Excel file...",
      "Extracting equipment and anomaly features...",
      "Running QWEN AI prediction model...",
      "Calculating confidence scores...",
      "Generating explanations with AI...",
      "Analyzing maintenance requirements...",
      "Matching optimal maintenance windows...",
      // "Creating recommended action plans...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessingProgress(((i + 1) / steps.length) * 100);
      toast({
        title: "Processing Step " + (i + 1),
        description: steps[i],
      });
    }


    processAnomaly(uploadedFile).then(res => {
      console.log(res.data.exported_anomalies);
      setProcessedAnomalies(res.data.exported_anomalies);
      setIsProcessing(false);
      toast({
        title: "ML Classification Complete!",
        description: `${res.data.count} anomalies processed with AI predictions and maintenance recommendations`,
      });
    })

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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("anomalyUpload.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("anomalyUpload.subtitle")}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Using QWEN AI Model for Classification
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            {t("anomalyUpload.fileUpload")}
          </TabsTrigger>
          <TabsTrigger value="results">
            {t("anomalyUpload.results")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Anomaly Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {t("anomalyUpload.uploadExcel")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("anomalyUpload.selectFile")}
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="mt-4 max-w-sm mx-auto"
                />
              </div>

              {uploadedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">
                        {t("anomalyUpload.fileReady")}
                      </div>
                      <div className="text-sm text-green-600">
                        {uploadedFile.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                    <span className="font-medium">
                      Processing with QWEN AI Model
                    </span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(processingProgress)}% complete
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={processAnomalyFile}
                  disabled={!uploadedFile || isProcessing}
                  className="flex-1"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  {isProcessing
                    ? t("anomalyUpload.processing")
                    : t("anomalyUpload.runClassification")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {processedAnomalies && processedAnomalies.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  ML Classification Results ({processedAnomalies.length}{" "}
                  anomalies)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("anomalyList.equipment")}</TableHead>
                      <TableHead>
                        {t("anomalyUpload.predictedCriticality")}
                      </TableHead>
                      {/* <TableHead>{t("anomalyUpload.maintenance")}</TableHead> */}
                      {/* <TableHead>
                        {t("anomalyUpload.maintenanceWindow")}
                      </TableHead>
                      <TableHead>{t("anomalyUpload.feedback")}</TableHead> */}
                      {/* <TableHead>{t("common.actions")}</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedAnomalies.map((anomaly) => (
                      <TableRow key={anomaly.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {anomaly.num_equipement}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {anomaly.equipement_description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant="secondary"
                              className={getCriticalityColor(
                                anomaly.criticite,
                              )}
                            >
                              {getCriticalityLevel(anomaly.criticite)}{" "}
                              ({anomaly.criticite}/15)
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              F:{anomaly.integrite} D:
                              {anomaly.disponibilite} PS:
                              {anomaly.process_safety}
                            </div>
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          {anomaly.requiresMaintenanceShutdown ? (
                            <div className="text-sm">
                              <div className="text-orange-600 font-medium">
                                {anomaly.suggestedMaintenanceDays}{" "}
                                {t("anomalyList.days")}
                              </div>
                              <div className="text-muted-foreground">
                                {t("anomalyUpload.shutdownRequired")}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("anomalyUpload.noShutdown")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {t("anomalyUpload.editMaintenance")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t("anomalyUpload.editMaintenanceDesc")}
                                </DialogDescription>
                              </DialogHeader>
                              <AnomalyMaintenanceForm
                                anomaly={anomaly}
                                maintenanceWindows={maintenanceWindows}
                                onUpdate={(updatedAnomaly) => {
                                  setProcessedAnomalies((prev) =>
                                    prev.map((a) =>
                                      a.id === updatedAnomaly.id
                                        ? updatedAnomaly
                                        : a,
                                    ),
                                  );
                                }}
                                t={t}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("anomalyUpload.noResultsYet")}
                </h3>
                <p className="text-muted-foreground">
                  {t("anomalyUpload.noResultsDesc")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Maintenance Form Component
interface AnomalyMaintenanceFormProps {
  anomaly: ProcessedAnomaly;
  maintenanceWindows: MaintenanceWindow[];
  onUpdate: (anomaly: ProcessedAnomaly) => void;
  t: (key: string) => string;
}

const AnomalyMaintenanceForm: React.FC<AnomalyMaintenanceFormProps> = ({
  anomaly,
  maintenanceWindows,
  onUpdate,
  t,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    requiresMaintenanceShutdown: anomaly.maintenance,
    suggestedMaintenanceDays: anomaly.maintenanceDuration || 1,
    suggestedMaintenanceWindow: anomaly.suggestedMaintenanceWindow || "",
  });

  const [isCreatingWindow, setIsCreatingWindow] = React.useState(false);
  const [newWindowData, setNewWindowData] = React.useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    capacity: 10,
    type: "routine" as "routine" | "emergency" | "shutdown",
  });

  const suitableWindows = maintenanceWindows.filter(
    (w) =>
      w.duration >= formData.suggestedMaintenanceDays &&
      w.assignedAnomalies < w.capacity,
  );

  const handleSave = () => {
    const updatedAnomaly: ProcessedAnomaly = {
      ...anomaly,
      requiresMaintenanceShutdown: formData.requiresMaintenanceShutdown,
      suggestedMaintenanceDays: formData.requiresMaintenanceShutdown
        ? formData.suggestedMaintenanceDays
        : undefined,
      suggestedMaintenanceWindow: formData.requiresMaintenanceShutdown
        ? formData.suggestedMaintenanceWindow
        : undefined,
    };

    onUpdate(updatedAnomaly);
    toast({
      title: t("anomalyUpload.saveChanges"),
      description: "Maintenance details updated successfully",
    });
  };

  const handleCreateWindow = () => {
    if (
      !newWindowData.name ||
      !newWindowData.startDate ||
      !newWindowData.endDate
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would create the window via API
    toast({
      title: "Window Created",
      description: `${newWindowData.name} has been created successfully`,
    });

    setIsCreatingWindow(false);
    setNewWindowData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      capacity: 10,
      type: "routine",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.requiresMaintenanceShutdown}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                requiresMaintenanceShutdown: e.target.checked,
                suggestedMaintenanceWindow: e.target.checked
                  ? prev.suggestedMaintenanceWindow
                  : "",
              }))
            }
          />
          <Label>{t("anomalyUpload.requiresMaintenance")}</Label>
        </div>

        {formData.requiresMaintenanceShutdown && (
          <div className="space-y-4 ml-6">
            <div>
              <Label>{t("anomalyUpload.maintenanceDurationDays")}</Label>
              <Input
                type="number"
                min="1"
                value={formData.suggestedMaintenanceDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    suggestedMaintenanceDays: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div>
              <Label>{t("anomalyUpload.selectMaintenanceWindow")}</Label>
              {suitableWindows.length > 0 ? (
                <Select
                  value={formData.suggestedMaintenanceWindow}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      suggestedMaintenanceWindow: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("anomalyUpload.selectMaintenanceWindow")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {suitableWindows.map((window) => (
                      <SelectItem key={window.id} value={window.id}>
                        {window.name} ({window.duration} days,{" "}
                        {window.capacity - window.assignedAnomalies} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  {t("anomalyUpload.noWindowAvailable")}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setIsCreatingWindow(!isCreatingWindow)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("anomalyUpload.createNewWindow")}
            </Button>

            {isCreatingWindow && (
              <Card className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("anomalyUpload.windowName")}</Label>
                    <Input
                      value={newWindowData.name}
                      onChange={(e) =>
                        setNewWindowData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter window name"
                    />
                  </div>
                  <div>
                    <Label>{t("anomalyUpload.windowType")}</Label>
                    <Select
                      value={newWindowData.type}
                      onValueChange={(value: any) =>
                        setNewWindowData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">
                          {t("anomalyUpload.routine")}
                        </SelectItem>
                        <SelectItem value="emergency">
                          {t("anomalyUpload.emergency")}
                        </SelectItem>
                        <SelectItem value="shutdown">
                          {t("anomalyUpload.shutdown")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t("anomalyUpload.description")}</Label>
                  <Input
                    value={newWindowData.description}
                    onChange={(e) =>
                      setNewWindowData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("anomalyUpload.startDate")}</Label>
                    <Input
                      type="date"
                      value={newWindowData.startDate}
                      onChange={(e) =>
                        setNewWindowData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>{t("anomalyUpload.endDate")}</Label>
                    <Input
                      type="date"
                      value={newWindowData.endDate}
                      onChange={(e) =>
                        setNewWindowData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateWindow}>
                    {t("common.create")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingWindow(false)}
                  >
                    {t("anomalyUpload.cancel")}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleSave}>{t("anomalyUpload.saveChanges")}</Button>
      </DialogFooter>
    </div>
  );
};

export default AnomalyUpload;
