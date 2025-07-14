import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { addMaintenanceWindow, deleteMaintenanceWindow, editMaintenanceWindow, getMaintenanceWindows } from "@/services/maintenanceWindow";

interface MaintenanceWindow {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  // assignedAnomalies: number;
  status: "planned" | "active" | "completed" | "cancelled";
  type: "routine" | "emergency" | "shutdown";
}

const MaintenanceWindows: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [windows, setWindows] = React.useState<MaintenanceWindow[]>([]);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingWindow, setEditingWindow] =
    React.useState<MaintenanceWindow | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    end_date: "",
    start_date: "",
    // capacity: "",
    type: "routine" as MaintenanceWindow["type"],
  });
  React.useEffect(() => {
    getMaintenanceWindows().then(res => {
      console.log(res);
      setWindows(res.data)
    })
  }, [])
  const handleCreateOrEdit = async () => {
    if (
      !formData.name ||
      !formData.start_date ||
      !formData.end_date
      // !formData.capacity
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const start_date = new Date(formData.start_date);
    const end_date = new Date(formData.end_date);

    if (end_date <= start_date) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const windowData: MaintenanceWindow = {
      id: editingWindow?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: editingWindow?.status || "planned",
      type: formData.type,
    };

    if (editingWindow) {
      await editMaintenanceWindow(editingWindow?.id, windowData)
      setWindows((prev) =>
        prev.map((w) => (w.id === editingWindow.id ? windowData : w)),
      );
      toast({
        title: "Maintenance Window Updated",
        description: `${windowData.name} has been updated successfully`,
      });
    } else {
      await addMaintenanceWindow(formData)
      setWindows((prev) => [...prev, windowData]);
      toast({
        title: "Maintenance Window Created",
        description: `${windowData.name} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
    setEditingWindow(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      type: "routine",
    });
  };

  const handleEdit = (window: MaintenanceWindow) => {
    setEditingWindow(window);
    setFormData({
      name: window.name,
      description: window.description,
      start_date: format(window.start_date, "yyyy-MM-dd"),
      end_date: format(window.end_date, "yyyy-MM-dd"),
      // capacity: window.capacity.toString(),
      type: window.type,
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: MaintenanceWindow["status"],
  ) => {
    const target = windows.find((w) => (w.id == id))
    console.log(target);
    
    await editMaintenanceWindow(target.id, { ...target, status: newStatus })
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
    );
    toast({
      title: t("maintenanceWindows.statusUpdated"),
      description: t("maintenanceWindows.statusUpdateSuccess"),
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMaintenanceWindow(id);
    setWindows((prev) => prev.filter((w) => w.id !== id));
    toast({
      title: t("maintenanceWindows.windowDeleted"),
      description: t("maintenanceWindows.deleteSuccess"),
    });
  };

  const getStatusColor = (status: MaintenanceWindow["status"]) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: MaintenanceWindow["type"]) => {
    switch (type) {
      case "routine":
        return "bg-blue-100 text-blue-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "shutdown":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDuration = (start_date: Date, end_date: Date) => {
    return differenceInDays(end_date, start_date) + 1;
  };

  const getUtilization = (assigned: number, capacity: number) => {
    return Math.round((assigned / capacity) * 100);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("maintenanceWindows.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("maintenanceWindows.subtitle")}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Window
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingWindow
                    ? "Edit Maintenance Window"
                    : "Create Maintenance Window"}
                </DialogTitle>
                <DialogDescription>
                  {editingWindow
                    ? "Update the maintenance window details below."
                    : "Create a new maintenance window for scheduling anomaly resolutions."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter window name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    className="col-span-3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <select
                    id="type"
                    className="col-span-3 h-10 px-3 py-2 border border-input rounded-md"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as MaintenanceWindow["type"],
                      }))
                    }
                  >
                    <option value="routine">Routine</option>
                    <option value="emergency">Emergency</option>
                    <option value="shutdown">Shutdown</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    className="col-span-3"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_date" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    className="col-span-3"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateOrEdit}>
                  {editingWindow ? "Update Window" : "Create Window"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold">{windows.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Windows
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {windows.filter((w) => w.status === "planned").length}
                </div>
                <div className="text-sm text-muted-foreground">Planned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Windows Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Maintenance Windows ({windows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("maintenanceWindows.name")}</TableHead>
                <TableHead>{t("maintenanceWindows.type")}</TableHead>
                <TableHead>{t("maintenanceWindows.status")}</TableHead>
                <TableHead>{t("maintenanceWindows.duration")}</TableHead>
                <TableHead>{t("maintenanceWindows.dateRange")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {windows.map((window) => (
                <TableRow key={window.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{window.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {window.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getTypeColor(window.type)}
                    >
                      {window.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={window.status}
                      onValueChange={(value) =>
                        handleStatusChange(
                          window.id,
                          value as MaintenanceWindow["status"],
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">
                          {t("maintenanceWindows.statusPlanned")}
                        </SelectItem>
                        <SelectItem value="active">
                          {t("maintenanceWindows.statusActive")}
                        </SelectItem>
                        <SelectItem value="completed">
                          {t("maintenanceWindows.statusCompleted")}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {t("maintenanceWindows.statusCancelled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {getDuration(window.start_date, window.end_date)}{" "}
                        {t("maintenanceWindows.days")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(window.start_date, "MMM dd, yyyy")}</div>
                      <div className="text-muted-foreground">
                        {t("maintenanceWindows.to")}{" "}
                        {format(window.end_date, "MMM dd, yyyy")}
                      </div>
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
                        <DropdownMenuItem onClick={() => handleEdit(window)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("maintenanceWindows.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(window.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("maintenanceWindows.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {windows.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No maintenance windows
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first maintenance window to start scheduling anomaly
                resolutions
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Window
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceWindows;
