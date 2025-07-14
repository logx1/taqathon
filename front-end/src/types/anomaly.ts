export type SeverityLevel = "low" | "medium" | "high";
export type ImpactCategory = "safety" | "deadline" | "operations";
export type AnomalyStatus = "open" | "in-progress" | "resolved" | "archived";
export type UserRole = "operator" | "engineer" | "manager" | "admin";

export interface User {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
  department?: string;
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  affectedUnit: string;
  severityLevel: SeverityLevel;
  impactCategory: ImpactCategory;
  status: AnomalyStatus;
  reportedBy: User;
  assignedTo?: User;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  attachments?: string[];
  comments: AnomalyComment[];
  maintenanceScheduleDate?: Date;
  linkedAnomalies?: string[];
}

export interface AnomalyComment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  type: "comment" | "status_change" | "assignment";
}

export interface AnomalyStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  archived: number;
  critical: number;
  warning: number;
  low: number;
}

export interface FilterOptions {
  status?: AnomalyStatus[];
  severity?: SeverityLevel[];
  unit?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedTo?: string[];
}

// Admin-specific types
export interface SystemSettings {
  id: string;
  siteName: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  notificationSettings: {
    emailNotifications: boolean;
    slackIntegration: boolean;
    webhookUrl?: string;
  };
  securitySettings: {
    passwordMinLength: number;
    requireTwoFactor: boolean;
    sessionTimeout: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: any;
}

export interface AdminStats {
  totalUsers: number;
  totalAnomalies: number;
  activeUsers: number;
  criticalAnomalies: number;
  systemUptime: string;
  storageUsed: string;
  dailyActiveUsers: number;
  weeklyNewAnomalies: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  userCount: number;
  isActive: boolean;
}
