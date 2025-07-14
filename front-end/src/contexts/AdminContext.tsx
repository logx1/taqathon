import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  SystemSettings,
  AuditLog,
  AdminStats,
  Department,
} from "@/types/anomaly";
import { mockUsers } from "@/lib/mockData";
import { getUsers, signup } from "@/services/auth";
import { updateStatus, updateUser as userUpdate, deleteUser as userDelete } from "@/services/user";
interface AdminContextType {
  // User Management
  users: User[];
  setUsers: any;
  createUser: (userData: Omit<User, "id" | "createdAt">) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string) => Promise<boolean>;

  // System Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<boolean>;

  // Audit Logs
  auditLogs: AuditLog[];
  getAuditLogs: (filters?: any) => Promise<AuditLog[]>;

  // Admin Stats
  adminStats: AdminStats;
  refreshStats: () => Promise<void>;

  // Department Management
  departments: Department[];
  createDepartment: (
    dept: Omit<Department, "id" | "userCount">,
  ) => Promise<boolean>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<boolean>;
  deleteDepartment: (id: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

// Mock data for admin functionality
const mockSystemSettings: SystemSettings = {
  id: "1",
  siteName: "TAQAMOROCCO Anomaly Management",
  allowRegistration: true,
  maintenanceMode: false,
  maxFileSize: 10, // MB
  allowedFileTypes: ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xlsx"],
  notificationSettings: {
    emailNotifications: true,
    slackIntegration: false,
    webhookUrl: "",
  },
  securitySettings: {
    passwordMinLength: 8,
    requireTwoFactor: false,
    sessionTimeout: 30, // minutes
  },
};

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Operator",
    action: "LOGIN",
    resource: "AUTH",
    timestamp: new Date("2024-01-15T08:30:00"),
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
  },
  {
    id: "2",
    userId: "2",
    userName: "Sarah Engineer",
    action: "CREATE",
    resource: "ANOMALY",
    resourceId: "1",
    timestamp: new Date("2024-01-15T09:15:00"),
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0...",
  },
  {
    id: "3",
    userId: "3",
    userName: "Mike Manager",
    action: "UPDATE",
    resource: "USER",
    resourceId: "4",
    timestamp: new Date("2024-01-15T10:20:00"),
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0...",
  },
];

const mockAdminStats: AdminStats = {
  totalUsers: 15,
  totalAnomalies: 42,
  activeUsers: 12,
  criticalAnomalies: 3,
  systemUptime: "99.9%",
  storageUsed: "2.4 GB",
  dailyActiveUsers: 8,
  weeklyNewAnomalies: 7,
};

const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Operations",
    description: "Main operational team",
    managerId: "3",
    userCount: 8,
    isActive: true,
  },
  {
    id: "2",
    name: "Maintenance",
    description: "Equipment maintenance team",
    managerId: "2",
    userCount: 5,
    isActive: true,
  },
  {
    id: "3",
    name: "Safety",
    description: "Safety and compliance team",
    managerId: "3",
    userCount: 3,
    isActive: true,
  },
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [systemSettings, setSystemSettings] =
    useState<SystemSettings>(mockSystemSettings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [adminStats, setAdminStats] = useState<AdminStats>(mockAdminStats);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);

  const createUser = async (
    userData: Omit<User, "id" | "createdAt">,
  ): Promise<boolean> => {
    const res = await signup(
      userData.full_name,
      userData.email,
      userData.role,
      userData.department,
    );
    console.log(res);

    if (res && res.status == 201) {
      setUsers((prev) => [
        ...prev,
        {
          id: res.data.id,
          full_name: res.data.full_name,
          email: res.data.email,
          role: res.data.role,
          createdAt: res.data.createdAt,
          lastLogin: res.data.lastLogin,
          isActive: res.data.isActive,
          department: res.data.department
        },
      ]);
      return true;
    }
    return false;
  };

  const updateUser = async (
    id: string,
    userData: Partial<User>,
  ): Promise<boolean> => {
    const res = await userUpdate(id, userData);
    if (res.data.success) {
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...userData } : user)),
      );
      return true;
    }
    return false;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const res = await userDelete(id);
    console.log(res);
    
    if (res.data.success) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      return true;
    }
    return false;
  };

  const toggleUserStatus = async (id: string): Promise<boolean> => {
    const res = await updateStatus({ id });
    console.log(res);

    if (res.data.success) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: !user.isActive } : user,
        ),
      );
      return true;
    }
    return false;
  };

  const updateSystemSettings = async (
    settings: Partial<SystemSettings>,
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSystemSettings((prev) => ({ ...prev, ...settings }));
    return true;
  };

  const getAuditLogs = async (filters?: any): Promise<AuditLog[]> => {
    // Simulate API call with filters
    await new Promise((resolve) => setTimeout(resolve, 500));
    return auditLogs;
  };

  const refreshStats = async (): Promise<void> => {
    // Simulate API call to refresh stats
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setAdminStats({
      ...adminStats,
      activeUsers: Math.floor(Math.random() * 20) + 10,
      dailyActiveUsers: Math.floor(Math.random() * 15) + 5,
    });
  };

  const createDepartment = async (
    dept: Omit<Department, "id" | "userCount">,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newDept: Department = {
      ...dept,
      id: Math.random().toString(36).substr(2, 9),
      userCount: 0,
    };

    setDepartments((prev) => [...prev, newDept]);
    return true;
  };

  const updateDepartment = async (
    id: string,
    dept: Partial<Department>,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...dept } : d)),
    );
    return true;
  };

  const deleteDepartment = async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setDepartments((prev) => prev.filter((d) => d.id !== id));
    return true;
  };

  const value = {
    users,
    setUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    systemSettings,
    updateSystemSettings,
    auditLogs,
    getAuditLogs,
    adminStats,
    refreshStats,
    departments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
