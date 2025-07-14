import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  User,
  Activity,
  Globe,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AuditLogs: React.FC = () => {
  const { auditLogs, getAuditLogs } = useAdmin();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAction, setSelectedAction] = React.useState("all");
  const [selectedResource, setSelectedResource] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>(
    {},
  );
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction =
        selectedAction === "all" || log.action === selectedAction;
      const matchesResource =
        selectedResource === "all" || log.resource === selectedResource;

      // Date filtering
      const logDate = new Date(log.timestamp);
      const matchesDate =
        (!dateRange.from || logDate >= dateRange.from) &&
        (!dateRange.to || logDate <= dateRange.to);

      return matchesSearch && matchesAction && matchesResource && matchesDate;
    });
  }, [auditLogs, searchQuery, selectedAction, selectedResource, dateRange]);

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "LOGIN":
        return "bg-green-100 text-green-800";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800";
      case "CREATE":
        return "bg-blue-100 text-blue-800";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "FAILED_LOGIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case "LOGIN":
        return <CheckCircle className="w-3 h-3" />;
      case "LOGOUT":
        return <XCircle className="w-3 h-3" />;
      case "CREATE":
        return <Activity className="w-3 h-3" />;
      case "UPDATE":
        return <Activity className="w-3 h-3" />;
      case "DELETE":
        return <AlertTriangle className="w-3 h-3" />;
      case "FAILED_LOGIN":
        return <Shield className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource.toUpperCase()) {
      case "USER":
        return "bg-purple-100 text-purple-800";
      case "ANOMALY":
        return "bg-orange-100 text-orange-800";
      case "SYSTEM":
        return "bg-blue-100 text-blue-800";
      case "AUTH":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Resource", "IP Address"],
      ...filteredLogs.map((log) => [
        format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
        log.userName,
        log.action,
        log.resource,
        log.ipAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">
              Monitor system activity and user actions
            </p>
          </div>
          <Button onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="FAILED_LOGIN">Failed Login</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedResource}
              onValueChange={setSelectedResource}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ANOMALY">Anomaly</SelectItem>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="AUTH">Authentication</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange as any}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedAction("all");
                setSelectedResource("all");
                setDateRange({});
              }}
            >
              Clear Filters
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {auditLogs.length} log entries
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">
                          {format(log.timestamp, "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(log.timestamp, "HH:mm:ss")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {log.userName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("gap-1", getActionColor(log.action))}
                    >
                      {getActionIcon(log.action)}
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getResourceColor(log.resource)}
                    >
                      {log.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.resourceId ? (
                        <span className="font-mono text-xs">
                          ID: {log.resourceId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{log.ipAddress}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.action.includes("FAILED")
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {log.action.includes("FAILED") ? "Failed" : "Success"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No logs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or date range
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {
                    filteredLogs.filter((log) => !log.action.includes("FAILED"))
                      .length
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  Successful Actions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {
                    filteredLogs.filter((log) => log.action.includes("FAILED"))
                      .length
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  Failed Actions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {new Set(filteredLogs.map((log) => log.userId)).size}
                </div>
                <div className="text-xs text-muted-foreground">
                  Unique Users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold">{filteredLogs.length}</div>
                <div className="text-xs text-muted-foreground">
                  Total Actions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;
