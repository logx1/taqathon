import React from "react";
import { Link } from "react-router-dom";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  List,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Building,
  Link as LinkIcon,
  Save,
  FileText,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/api/axiosInstance";
import { deleteAnomaly, editAnomaly, getAnomalies } from "@/services/anomalies";
import { getMaintenanceWindows } from "@/services/maintenanceWindow";

interface ActionPlan {
  id: string;
  description: string;
  steps: string[];
  estimatedDuration: number; // in days
  requiredResources: string[];
  responsiblePerson: string;
  dateCreated: Date;
  status: "draft" | "approved" | "in-progress" | "completed";
}

interface EnhancedAnomaly {
  id: string;
  num_equipement: string;
  systeme: string;
  description: string;
  detectionDate: Date;
  equipement_description: string;
  sectionProprietaire: string;
  fiabiliteIntegrite: number; // 1-5
  disponibilite: number; // 1-5
  processSafety: number; // 1-5
  criticite: number; // sum of above 3
  maintenance: boolean;
  maintenanceDuration?: number;
  linkedMaintenanceWindow?: string;
  status: "open" | "in-progress" | "resolved" | "archived";
  rex?: {
    notes: string;
    attachments: File[];
    dateCreated: Date;
    createdBy: string;
  };
  actionPlan?: ActionPlan;
}

interface MaintenanceWindow {
  id: string;
  name: string;
  duration: number;
  availableCapacity: number;
}

// Helper function to generate smart page numbers for pagination
const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | string)[] => {
  const delta = 2; // Number of pages to show on each side of current page
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push("...", totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  // Remove duplicates and ensure proper order
  return rangeWithDots.filter(
    (item, index, arr) => arr.indexOf(item) === index,
  );
};

const AnomalyList: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedCriticality, setSelectedCriticality] =
    React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("date-desc");

  const [editingAnomaly, setEditingAnomaly] =
    React.useState<EnhancedAnomaly | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [rexAnomaly, setRexAnomaly] = React.useState<EnhancedAnomaly | null>(
    null,
  );
  const [isRexDialogOpen, setIsRexDialogOpen] = React.useState(false);
  const [rexNotes, setRexNotes] = React.useState("");
  const [rexFiles, setRexFiles] = React.useState<File[]>([]);
  const [actionPlanAnomaly, setActionPlanAnomaly] =
    React.useState<EnhancedAnomaly | null>(null);
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] =
    React.useState(false);
  const [actionPlanData, setActionPlanData] = React.useState({
    description: "",
    steps: [""],
    estimatedDuration: 1,
    requiredResources: [""],
    responsiblePerson: "",
    status: "draft",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [allAnomalies, setAllAnomalies] = React.useState<EnhancedAnomaly[]>([]);
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [filteredCurrentPage, setFilteredCurrentPage] = React.useState(1);
  const getDuration = (start_date: Date, end_date: Date) => {
    return differenceInDays(end_date, start_date) + 1;
  };
  // Function to fetch data and update state
  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const result = await getAnomalies(page);
      console.log(result);

      setAnomalies(result.data.anomalies);
      setTotalItems(result.data.total_anomalies);
      setTotalPages(result.data.total_pages);
    } catch (error) {
      console.error("Error fetching anomalies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch anomalies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all anomalies for filtering
  const fetchAllAnomalies = async () => {
    setLoading(true);
    try {
      const allData: EnhancedAnomaly[] = [];
      const firstPage = await getAnomalies(1);
      const totalPagesCount = firstPage.data.total_pages;

      // Fetch all pages
      for (let page = 1; page <= totalPagesCount; page++) {
        const result = await getAnomalies(page);
        allData.push(...result.data.anomalies);
      }
      setAllAnomalies(allData);
      setTotalItems(firstPage.data.total_anomalies);
      setTotalPages(firstPage.data.total_pages);
    } catch (error) {
      console.error("Error fetching all anomalies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch anomalies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [anomalies, setAnomalies] = React.useState<EnhancedAnomaly[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = React.useState<MaintenanceWindow[]>([]);
  React.useEffect(() => {
    getMaintenanceWindows().then(res => {
      console.log(res);
      setMaintenanceWindows(res.data)
    })
  }, [])
  // React.useEffect(() => {}, [])
  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return (
      selectedStatus !== "all" ||
      selectedCriticality !== "all" ||
      searchQuery.trim() !== ""
    );
  }, [selectedStatus, selectedCriticality, searchQuery]);

  // Filter and paginate anomalies
  const { filteredAnomalies, filteredTotalPages, filteredTotalItems } =
    React.useMemo(() => {
      const dataToFilter = hasActiveFilters ? allAnomalies : anomalies;

      if (!hasActiveFilters) {
        // No filters active, return current page data
        return {
          filteredAnomalies: anomalies,
          filteredTotalPages: totalPages,
          filteredTotalItems: totalItems,
        };
      }

      // Filter all anomalies
      let filtered = dataToFilter.filter((anomaly) => {
        const matchesSearch =
          anomaly.num_equipement
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          anomaly.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          anomaly.equipement_description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          anomaly.systeme.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedStatus === "all" || anomaly.status === selectedStatus;

        const matchesCriticality =
          selectedCriticality === "all" ||
          (selectedCriticality === "high" && anomaly.criticite >= 12) ||
          (selectedCriticality === "medium" &&
            anomaly.criticite >= 8 &&
            anomaly.criticite < 12) ||
          (selectedCriticality === "low" && anomaly.criticite < 8);

        return matchesSearch && matchesStatus && matchesCriticality;
      });

      // Sort filtered results
      switch (sortBy) {
        case "criticality":
          filtered.sort((a, b) => b.criticite - a.criticite);
          break;
        case "equipment":
          filtered.sort((a, b) =>
            a.num_equipement.localeCompare(b.num_equipement),
          );
          break;
        default:
          break;
      }

      // Paginate filtered results
      const filteredTotal = filtered.length;
      const filteredPages = Math.ceil(filteredTotal / itemsPerPage);
      const startIndex = (filteredCurrentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedFiltered = filtered.slice(startIndex, endIndex);

      return {
        filteredAnomalies: paginatedFiltered,
        filteredTotalPages: filteredPages,
        filteredTotalItems: filteredTotal,
      };
    }, [
      searchQuery,
      selectedStatus,
      selectedCriticality,
      sortBy,
      anomalies,
      allAnomalies,
      hasActiveFilters,
      filteredCurrentPage,
      totalPages,
      totalItems,
    ]);

  // Fetch data when component mounts or page changes (only when not filtering)
  React.useEffect(() => {
    if (!hasActiveFilters) {
      fetchData(currentPage);
    }
  }, [currentPage, hasActiveFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // When filters become active, fetch all data and switch to filtering mode
  React.useEffect(() => {
    if (hasActiveFilters && !isFiltering) {
      setIsFiltering(true);
      setFilteredCurrentPage(1);
      fetchAllAnomalies();
    } else if (!hasActiveFilters && isFiltering) {
      // Filters cleared, switch back to normal pagination
      setIsFiltering(false);
      setFilteredCurrentPage(1);
      fetchData(currentPage);
    }
  }, [hasActiveFilters, isFiltering, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset filtered page when filters change
  React.useEffect(() => {
    if (hasActiveFilters) {
      setFilteredCurrentPage(1);
    }
  }, [
    searchQuery,
    selectedStatus,
    selectedCriticality,
    sortBy,
    hasActiveFilters,
  ]);

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

  const handleEdit = (anomaly: EnhancedAnomaly) => {
    setEditingAnomaly({ ...anomaly });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAnomaly) return;

    // Recalculate criticite when individual scores change
    const newCriticite =
      editingAnomaly.integrite +
      editingAnomaly.disponibilite +
      editingAnomaly.process_safety;
    const updatedAnomaly = {
      ...editingAnomaly,
      criticite: newCriticite
    };
    console.log("updatedAnomaly: ", updatedAnomaly);

    const target = anomalies.find((a) => (a.id == updatedAnomaly.id))
    console.log(target);
    const res = await editAnomaly(target.id, updatedAnomaly)
    console.log(res.data);

    setAnomalies((prev) =>
      prev.map((a) => (a.id == updatedAnomaly.id ? updatedAnomaly : a)),
    );
    setIsEditDialogOpen(false);
    setEditingAnomaly(null);

    toast({
      title: "Anomaly Updated",
      description: "The anomaly has been updated successfully",
    });
  };

  const suggestMaintenanceWindow = (days: number) => {
    const suitable = maintenanceWindows.filter(
      (w) => getDuration(w.start_date, w.end_date) >= days
    );
    if (suitable.length > 0) {
      // Find the closest match by duration
      return suitable.reduce((prev, current) =>
        Math.abs(current.duration - days) < Math.abs(prev.duration - days)
          ? current
          : prev,
      );
    }
    return null;
  };
  console.log(editingAnomaly);

  const handleMaintenanceDaysChange = (days: number) => {
    if (!editingAnomaly) return;

    const suggested = suggestMaintenanceWindow(days);
    console.log(suggested);

    setEditingAnomaly((prev) => ({
      ...prev!,
      maintenanceDuration: days,
      maintenance_windows: suggested?.id || undefined,
    }));

    if (suggested) {
      toast({
        title: "Maintenance Window Suggested",
        description: `"${suggested.name}" matches your ${days} day requirement`,
      });
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (hasActiveFilters) {
      // When filtering, change filtered page
      setFilteredCurrentPage(page);
      console.log(`Filtered pagination: Page ${page} of filtered results`);
    } else {
      // Normal pagination, fetch new page
      setCurrentPage(page);
      console.log(
        `API Call: Fetch page ${page} with ${itemsPerPage} items per page`,
      );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("anomalyList.title")}
            </h1>
            <p className="text-muted-foreground">{t("anomalyList.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("anomalyList.filtersSearch")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("anomalyList.search")}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("anomalyList.allStatus")}
                </SelectItem>
                <SelectItem value="open">{t("common.open")}</SelectItem>
                <SelectItem value="in-progress">
                  {t("common.inProgress")}
                </SelectItem>
                <SelectItem value="resolved">{t("common.resolved")}</SelectItem>
                <SelectItem value="archived">{t("common.archived")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedCriticality}
              onValueChange={setSelectedCriticality}
            >
              <SelectTrigger>
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("anomalyList.allCriticality")}
                </SelectItem>
                <SelectItem value="high">{t("common.high")} (12-15)</SelectItem>
                <SelectItem value="medium">
                  {t("common.medium")} (8-11)
                </SelectItem>
                <SelectItem value="low">{t("common.low")} (3-7)</SelectItem>
              </SelectContent>
            </Select>

          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? (
                  <>
                    {t("anomalyList.showing")} {filteredAnomalies.length}{" "}
                    {t("anomalyList.of")} {filteredTotalItems}{" "}
                    {t("anomalyList.filtered")} {t("anomalyList.anomalies")}{" "}
                    {t("anomalyList.on")} {t("anomalyList.page")}{" "}
                    {filteredCurrentPage} {t("anomalyList.of")}{" "}
                    {filteredTotalPages}
                    <br />
                    <span className="text-xs">
                      {t("anomalyList.total")} {t("anomalyList.filtered")}:{" "}
                      {filteredTotalItems} {t("anomalyList.anomalies")} (
                      {t("anomalyList.from")} {totalItems}{" "}
                      {t("anomalyList.total")})
                    </span>
                  </>
                ) : (
                  <>
                    {t("anomalyList.showing")} {filteredAnomalies.length}{" "}
                    {t("anomalyList.of")} {anomalies.length}{" "}
                    {t("anomalyList.anomalies")} {t("anomalyList.on")}{" "}
                    {t("anomalyList.page")} {currentPage}
                    <br />
                    <span className="text-xs">
                      {t("anomalyList.total")}: {totalItems}{" "}
                      {t("anomalyList.anomalies")} ({totalPages}{" "}
                      {t("anomalyList.pages")})
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            {t("anomalyList.anomalies")} ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("anomalyList.equipment")}</TableHead>
                <TableHead>{t("anomalyList.systemId")}</TableHead>
                <TableHead>{t("anomalyList.equipmentInfo")}</TableHead>
                <TableHead>{t("anomalyList.anomalyInfo")}</TableHead>
                <TableHead>{t("anomalyList.section")}</TableHead>
                <TableHead>{t("anomalyList.criticality")}</TableHead>
                <TableHead>{t("anomalyList.status")}</TableHead>
                <TableHead>{t("anomalyList.maintenance")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnomalies.map((anomaly) => (
                <TableRow key={anomaly.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {anomaly.num_equipement}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {anomaly.equipement_description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {anomaly.systeme}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium text-sm">
                        {anomaly.equipement_description}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        Equipment details
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm line-clamp-2 font-medium">
                        {anomaly.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Anomaly details
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {anomaly.section_proprietaire}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          getCriticalityColor(anomaly.criticite),
                        )}
                      >
                        {getCriticalityLevel(anomaly.criticite)} (
                        {anomaly.criticite}/15)
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        F:{anomaly.integrite} D:{anomaly.disponibilite}{" "}
                        PS:{anomaly.process_safety}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getStatusColor(anomaly.status))}
                    >
                      {anomaly.status.replace("-", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {anomaly.maintenance ? (
                        <div className="text-xs">
                          <div className="text-orange-600 font-medium">
                            {anomaly.maintenanceDuration} days
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <LinkIcon className="w-3 h-3" />
                            <span>Linked</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No shutdown
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t("common.actions")}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/anomaly/${anomaly.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("anomalyList.viewDetails")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(anomaly)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("anomalyList.editClassification")}
                        </DropdownMenuItem>
                        {(anomaly.status === "resolved" ||
                          anomaly.status === "archived") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setRexAnomaly(anomaly);
                                  setIsRexDialogOpen(true);
                                  setRexNotes(anomaly.rex?.notes || "");
                                  setRexFiles(anomaly.rex?.attachments || []);
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                {t("anomalyList.manageRex")}
                              </DropdownMenuItem>
                            </>
                          )}
                        {/* {anomaly.maintenance && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setActionPlanAnomaly(anomaly);
                                console.log(actionPlanAnomaly);

                                setIsActionPlanDialogOpen(true);
                                if (anomaly.actionPlan) {
                                  setActionPlanData({
                                    description: anomaly.actionPlan.description,
                                    steps: anomaly.actionPlan.steps,
                                    estimatedDuration:
                                      anomaly.actionPlan.estimatedDuration,
                                    requiredResources:
                                      anomaly.actionPlan.requiredResources,
                                    responsiblePerson:
                                      anomaly.actionPlan.responsiblePerson,
                                    status: anomaly.actionPlan.status,
                                  });
                                } else {
                                  setActionPlanData({
                                    description: "",
                                    steps: [""],
                                    estimatedDuration: 1,
                                    requiredResources: [""],
                                    responsiblePerson: "",
                                    status: "draft",
                                  });
                                }
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              {t("anomalyList.manageActionPlan")}
                            </DropdownMenuItem>
                          </>
                        )} */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(async () => {
                          await deleteAnomaly(anomaly.id)
                        })} className="text-destructive" >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading anomalies...</p>
          </div>
        )}

        {!loading && filteredAnomalies.length === 0 && totalItems === 0 && (
          <div className="text-center py-12">
            <List className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("anomalyList.noAnomaliesFound")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("anomalyList.adjustCriteria")}
            </p>
          </div>
        )}
      </CardContent>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  {t("anomalyList.page")} {filteredCurrentPage}{" "}
                  {t("anomalyList.of")} {filteredTotalPages}(
                  {(filteredCurrentPage - 1) * itemsPerPage + 1}-
                  {Math.min(
                    filteredCurrentPage * itemsPerPage,
                    filteredTotalItems,
                  )}{" "}
                  {t("anomalyList.of")} {filteredTotalItems})
                </>
              ) : (
                <>
                  {t("anomalyList.page")} {currentPage} {t("anomalyList.of")}{" "}
                  {totalPages}({(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                  {t("anomalyList.of")} {totalItems})
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={
                  hasActiveFilters
                    ? filteredCurrentPage === 1
                    : currentPage === 1
                }
              >
                {t("anomalyList.first")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(
                    hasActiveFilters
                      ? filteredCurrentPage - 1
                      : currentPage - 1,
                  )
                }
                disabled={
                  hasActiveFilters
                    ? filteredCurrentPage === 1
                    : currentPage === 1
                }
              >
                {t("anomalyList.previous")}
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1 mx-2">
                {getPageNumbers(
                  hasActiveFilters ? filteredCurrentPage : currentPage,
                  hasActiveFilters ? filteredTotalPages : totalPages,
                ).map((pageNum, index) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-1 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pageNum}
                      variant={
                        (hasActiveFilters
                          ? filteredCurrentPage
                          : currentPage) === pageNum
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum as number)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(
                    hasActiveFilters
                      ? filteredCurrentPage + 1
                      : currentPage + 1,
                  )
                }
                disabled={
                  hasActiveFilters
                    ? filteredCurrentPage === filteredTotalPages
                    : currentPage === totalPages
                }
              >
                {t("anomalyList.next")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(
                    hasActiveFilters ? filteredTotalPages : totalPages,
                  )
                }
                disabled={
                  hasActiveFilters
                    ? filteredCurrentPage === filteredTotalPages
                    : currentPage === totalPages
                }
              >
                {t("anomalyList.last")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>

      {/* Edit Anomaly Dialog */ }
  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Anomaly Classification</DialogTitle>
        <DialogDescription>
          Update the criticality scores and maintenance requirements for
          this anomaly.
        </DialogDescription>
      </DialogHeader>
      {editingAnomaly && (
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Equipment Number</Label>
              <Input value={editingAnomaly.num_equipement} disabled />
            </div>
            <div>
              <Label>System ID</Label>
              <Input value={editingAnomaly.systeme} disabled />
            </div>
          </div>

          <div>
            <Label>Anomaly Description</Label>
            <Input
              value={editingAnomaly.description}
              onChange={(e) =>
                setEditingAnomaly((prev) => ({
                  ...prev!,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Fiabilité Intégrité (1-5)</Label>
              <Select
                value={editingAnomaly.integrite.toString()}
                onValueChange={(value) =>
                  setEditingAnomaly((prev) => ({
                    ...prev!,
                    integrite: parseInt(value),
                  }))
                }
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
              <Label>Disponibilité (1-5)</Label>
              <Select
                value={editingAnomaly.disponibilite.toString()}
                onValueChange={(value) =>
                  setEditingAnomaly((prev) => ({
                    ...prev!,
                    disponibilite: parseInt(value),
                  }))
                }
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
              <Label>Process Safety (1-5)</Label>
              <Select
                value={editingAnomaly.process_safety.toString()}
                onValueChange={(value) =>
                  setEditingAnomaly((prev) => ({
                    ...prev!,
                    process_safety: parseInt(value),
                  }))
                }
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

          <div className="bg-gray-50 p-3 rounded-md">
            <Label className="text-sm font-medium">
              Total Criticality:{" "}
              {editingAnomaly.integrite +
                editingAnomaly.disponibilite +
                editingAnomaly.process_safety}
              /15
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically calculated as sum of the three criteria above
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintenance-shutdown"
                checked={editingAnomaly.maintenance}
                onCheckedChange={(checked) =>
                  setEditingAnomaly((prev) => ({
                    ...prev!,
                    maintenance: !!checked,
                    maintenanceDuration: checked
                      ? prev!.maintenanceDuration || 1
                      : undefined,
                    linkedMaintenanceWindow: undefined,
                  }))
                }
              />
              <Label htmlFor="maintenance-shutdown">
                Requires Maintenance Shutdown
              </Label>
            </div>

            {editingAnomaly.maintenance && (
              <div className="space-y-3 ml-6">
                <div>
                  <Label>Maintenance Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingAnomaly.maintenanceDuration || ""}
                    onChange={(e) =>
                      handleMaintenanceDaysChange(
                        parseInt(e.target.value) || 1,
                      )
                    }
                    placeholder="Enter number of days"
                  />
                </div>

                {editingAnomaly.maintenance && (
                  <div>
                    <Label>Suggested Maintenance Window</Label>
                    <Select
                      value={editingAnomaly.maintenance_windows || ""}
                      onValueChange={(value) =>
                        setEditingAnomaly((prev) => ({
                          ...prev!,
                          maintenance_windows: value || undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance window" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceWindows
                          .filter(
                            (w) =>
                              getDuration(w.start_date, w.end_date) >=
                              (editingAnomaly.maintenanceDuration || 0),
                          )
                          .map((window) => (
                            <SelectItem key={window.id} value={window.id}>
                              {window.name} ({getDuration(window.start_date, window.end_date)} days)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setIsEditDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button onClick={handleSaveEdit}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* REX Dialog */ }
  <Dialog open={isRexDialogOpen} onOpenChange={setIsRexDialogOpen}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{t("anomalyList.rexTitle")}</DialogTitle>
        <DialogDescription>
          {t("anomalyList.rexDescription")}
        </DialogDescription>
      </DialogHeader>
      {rexAnomaly && (
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {t("anomalyList.equipmentNumber")}:{" "}
              {rexAnomaly.num_equipement}
            </div>
            <div className="text-sm text-muted-foreground">
              {rexAnomaly.description}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>{t("anomalyList.rexNotes")}</Label>
              <Textarea
                value={rexNotes.length ? rexNotes : rexAnomaly.notes}
                onChange={(e) => setRexNotes(e.target.value)}
                placeholder={t("anomalyList.rexNotesPlaceholder")}
                rows={6}
                className="resize-none"
              />
            </div>



            {rexAnomaly.rex && (
              <div className="text-xs text-muted-foreground">
                {t("anomalyList.rexLastUpdated")}:{" "}
                {format(rexAnomaly.rex.dateCreated, "PPP")} {t("common.by")}{" "}
                {rexAnomaly.rex.createdBy}
              </div>
            )}
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsRexDialogOpen(false)}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={async () => {
            if (rexAnomaly) {
              await editAnomaly(rexAnomaly.id, { notes: rexNotes })
              const updatedAnomalies = anomalies.map((a) =>
                a.id === rexAnomaly.id
                  ? {
                    ...a,
                    rex: {
                      notes: rexNotes,
                      attachments: rexFiles,
                      dateCreated: new Date(),
                      createdBy: "Current User", // In real app, get from auth context
                    },
                  }
                  : a,
              );
              setAnomalies(updatedAnomalies);
              toast({
                title: t("anomalyList.rexSaved"),
                description: t("anomalyList.rexSavedDesc"),
              });
              setIsRexDialogOpen(false);
            }
          }}
        >
          <Save className="mr-2 h-4 w-4" />
          {t("anomalyList.saveRex")}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Action Plan Dialog */ }
  {/* <Dialog
        open={isActionPlanDialogOpen}
        onOpenChange={setIsActionPlanDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t("anomalyList.actionPlanTitle")}</DialogTitle>
            <DialogDescription>
              {t("anomalyList.actionPlanDescription")}
            </DialogDescription>
          </DialogHeader>
          {actionPlanAnomaly && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {t("anomalyList.equipmentNumber")}:{" "}
                  {actionPlanAnomaly.num_equipement}
                </div>
                <div className="text-sm text-muted-foreground">
                  {actionPlanAnomaly.description}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>{t("anomalyList.actionPlanDescLabel")}</Label>
                  <Textarea
                    value={actionPlanData.description.length ? actionPlanData.description : actionPlanAnomaly.action_plan_description}
                    onChange={(e) =>
                      setActionPlanData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder={t("anomalyList.actionPlanDescPlaceholder")}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{t("anomalyList.actionSteps")}</Label>
                  {actionPlanAnomaly.action_plan_steps.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...actionPlanData.steps];
                          newSteps[index] = e.target.value;
                          setActionPlanData((prev) => ({
                            ...prev,
                            steps: newSteps,
                          }));
                        }}
                        placeholder={`${t("anomalyList.step")} ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newSteps = actionPlanAnomaly.action_plan_steps.filter(
                            (_, i) => i !== index,
                          );
                          setActionPlanData((prev) => ({
                            ...prev,
                            steps: newSteps,
                          }));
                        }}
                        disabled={actionPlanAnomaly.action_plan_steps.length === 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setActionPlanData((prev) => ({
                        ...prev,
                        steps: [...prev.steps, ""],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    {t("anomalyList.addStep")}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>
                      {t("anomalyList.estimatedDuration")} (
                      {t("anomalyList.days")})
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={actionPlanAnomaly.action_plan_duration}
                      onChange={(e) =>
                        setActionPlanData((prev) => ({
                          ...prev,
                          estimatedDuration: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>{t("anomalyList.requiredResources")}</Label>
                  {actionPlanAnomaly.action_plan_resources.map((resource, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={resource}
                        onChange={(e) => {
                          const newResources = [
                            ...actionPlanData.requiredResources,
                          ];
                          newResources[index] = e.target.value;
                          setActionPlanData((prev) => ({
                            ...prev,
                            requiredResources: newResources,
                          }));
                        }}
                        placeholder={`${t("anomalyList.resource")} ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newResources =
                            actionPlanAnomaly.action_plan_resources.filter(
                              (_, i) => i !== index,
                            );
                          setActionPlanData((prev) => ({
                            ...prev,
                            requiredResources: newResources,
                          }));
                        }}
                        disabled={actionPlanAnomaly.action_plan_resources.length === 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setActionPlanData((prev) => ({
                        ...prev,
                        requiredResources: [...prev.requiredResources, ""],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    {t("anomalyList.addResource")}
                  </Button>
                </div>

                <div>
                  <Label>{t("anomalyList.actionPlanStatus")}</Label>
                  <Select
                    value={actionPlanAnomaly.action_plan_status}
                    onValueChange={(value) =>
                      setActionPlanData((prev) => ({
                        ...prev,
                        status: value as ActionPlan["status"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        {t("anomalyList.statusDraft")}
                      </SelectItem>
                      <SelectItem value="approved">
                        {t("anomalyList.statusApproved")}
                      </SelectItem>
                      <SelectItem value="in-progress">
                        {t("anomalyList.statusInProgress")}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("anomalyList.statusCompleted")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {actionPlanAnomaly.actionPlan && (
                  <div className="text-xs text-muted-foreground">
                    {t("anomalyList.actionPlanLastUpdated")}:{" "}
                    {format(actionPlanAnomaly.actionPlan.dateCreated, "PPP")}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionPlanDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (actionPlanAnomaly) {
                  editAnomaly(actionPlanAnomaly.id, {
                    ...actionPlanAnomaly, action_plan_description: actionPlanData.description,
                    action_plan_steps: actionPlanData.steps.filter(
                      (step) => step.trim() !== "",
                    ),
                    action_plan_duration: actionPlanData.estimatedDuration,
                    action_plan_resources:
                      actionPlanData.requiredResources.filter(
                        (resource) => resource.trim() !== "",
                      ),
                    action_plan_status: actionPlanData.status,
                  })
                  const updatedAnomalies = anomalies.map((a) =>
                    a.id === actionPlanAnomaly.id
                      ? {
                        ...a,
                        actionPlan: {
                          id: Date.now().toString(),
                          action_plan_description: actionPlanData.description,
                          action_plan_steps: actionPlanData.steps.filter(
                            (step) => step.trim() !== "",
                          ),
                          action_plan_duration: actionPlanData.estimatedDuration,
                          action_plan_resources:
                            actionPlanData.requiredResources.filter(
                              (resource) => resource.trim() !== "",
                            ),
                          action_plan_status: actionPlanData.status,
                        },
                      }
                      : a,
                  );
                  setAnomalies(updatedAnomalies);
                  toast({
                    title: t("anomalyList.actionPlanSaved"),
                    description: t("anomalyList.actionPlanSavedDesc"),
                  });
                  setIsActionPlanDialogOpen(false);
                }
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              {t("anomalyList.saveActionPlan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div >
  );
};

export default AnomalyList;
