import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  Mail,
  Calendar,
  Building,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { User, UserRole } from "@/types/anomaly";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getUsers } from "@/services/auth";

const UserManagement: React.FC = () => {
  const {
    users,
    setUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    departments,
  } = useAdmin();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state for create/edit user
  const [formData, setFormData] = React.useState({
    full_name: "",
    email: "",
    role: "operator" as UserRole,
    department: "",
    isActive: true,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("taqamorocco_user"))
    if (user)
    {
      console.log("I ACCESSED USERS REQUEST BLOCK");
      
      getUsers().then((res) => {
        console.log(res);
        setUsers(res.data)
      });
    }
  }, []);
  // Filter users
  const filteredUsers = React.useMemo(() => {
    
    return users.filter((user) => {
      console.log(user);
      
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && user.isActive !== false) ||
        (selectedStatus === "inactive" && user.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const handleCreateUser = async () => {
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await createUser({
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      isActive: formData.isActive,
    });

    if (success) {
      toast({
        title: "User created successfully",
        description: `${formData.full_name} has been added to the system`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } else {
      toast({
        title: "Error creating user",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.full_name || !formData.email) return;

    setIsLoading(true);
    const success = await updateUser(selectedUser.id, {
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      isActive: formData.isActive,
    });

    if (success) {
      // getUsers().then((res) => {
      //   console.log(res);
      //   setUsers(res.data)
      // });
      toast({
        title: "User updated successfully",
        description: `${formData.full_name}'s information has been updated`,
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
    } else {
      toast({
        title: "Error updating user",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      const success = await deleteUser(user.id);
      if (success) {
        toast({
          title: "User deleted",
          description: `${user.full_name} has been removed from the system`,
        });
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const success = await toggleUserStatus(user.id);
    if (success) {
      toast({
        title: "User status updated",
        description: `${user.full_name} has been ${user.isActive === false ? "activated" : "deactivated"}`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      role: "operator",
      department: "",
      isActive: true,
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      isActive: user.isActive !== false,
    });
    setIsEditDialogOpen(true);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-purple-100 text-purple-800";
      case "engineer":
        return "bg-blue-100 text-blue-800";
      case "operator":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getUserInitials = (full_name: string) => {
    return full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return  (
      <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage system users, roles, and permissions
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("capitalize", getRoleColor(user.role))}
                    >
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-muted-foreground" />
                      {user.department || "Not assigned"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.isActive !== false ? "default" : "secondary"
                      }
                      className={
                        user.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {user.createdAt
                        ? format(user.createdAt, "MMM dd, yyyy")
                        : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {user.lastLogin
                        ? format(user.lastLogin, "MMM dd, yyyy")
                        : "Never"}
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.isActive !== false ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with appropriate role and
              permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john.doe@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-full_name">Full Name *</Label>
              <Input
                id="edit-full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
