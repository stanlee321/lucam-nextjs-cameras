// Camera Types
export interface Camera {
  id: number;
  name: string;
  location: string;
  active: boolean;
  url?: string;
  lastSeen?: string;
  ipAddress?: string;
  port?: string | number;
}

// User Types
export type UserRole = 'SuperAdmin' | 'Admin' | 'Viewer';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  lastLogin?: string;
  active: boolean;
  email?: string;
}

// Activity Log Types
export interface ActivityLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

// Report Types
export interface Report {
  id: number;
  name: string;
  generatedOn: string;
  type: string;
  format: 'PDF' | 'CSV';
  url: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Filter Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface CameraFilters extends PaginationParams {
  active?: boolean;
  search?: string;
}

export interface UserFilters extends PaginationParams {
  role?: UserRole;
  active?: boolean;
  search?: string;
}

export interface ActivityLogFilters extends PaginationParams {
  user?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ReportFilters extends PaginationParams {
  type?: string;
  startDate?: string;
  endDate?: string;
}

// Settings
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'es';
  registrationInfo?: {
    name: string;
    company: string;
    email: string;
    registrationDate: string;
  };
} 