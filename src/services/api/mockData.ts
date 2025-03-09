import { Camera, User, ActivityLog, Report, UserRole } from './types';

// Mock Cameras
export const mockCameras: Camera[] = [
  {
    id: 101,
    name: 'Front Gate',
    location: 'Entrance',
    active: true,
    ipAddress: '192.168.1.101',
    port: 554,
    lastSeen: '2023-03-09T15:30:45Z',
  },
  {
    id: 102,
    name: 'Side Door',
    location: 'Warehouse',
    active: false,
    ipAddress: '192.168.1.102',
    port: 554,
    lastSeen: '2023-03-08T10:15:20Z',
  },
  {
    id: 103,
    name: 'Lobby',
    location: 'Office',
    active: true,
    ipAddress: '192.168.1.103',
    port: 8554,
    lastSeen: '2023-03-09T16:45:10Z',
  },
  {
    id: 104,
    name: 'Parking Lot',
    location: 'Exterior',
    active: true,
    ipAddress: '192.168.1.104',
    port: 554,
    lastSeen: '2023-03-09T14:22:30Z',
  },
  {
    id: 105,
    name: 'Reception',
    location: 'Office',
    active: true,
    ipAddress: '192.168.1.105',
    port: 8000,
    lastSeen: '2023-03-09T17:10:05Z',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Admin User',
    role: 'SuperAdmin',
    email: 'admin@example.com',
    active: true,
    lastLogin: '2023-03-09T16:00:00Z',
  },
  {
    id: 2,
    username: 'user',
    name: 'Regular User',
    role: 'Viewer',
    email: 'user@example.com',
    active: true,
    lastLogin: '2023-03-09T10:30:00Z',
  },
  {
    id: 3,
    username: 'john',
    name: 'John Smith',
    role: 'Admin',
    email: 'john@example.com',
    active: true,
    lastLogin: '2023-03-08T14:45:00Z',
  },
  {
    id: 4,
    username: 'alice',
    name: 'Alice Johnson',
    role: 'Viewer',
    email: 'alice@example.com',
    active: false,
    lastLogin: '2023-02-28T09:15:00Z',
  },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 1,
    timestamp: '2023-03-09T16:30:45Z',
    user: 'admin',
    action: 'User Login',
    details: 'Logged in from 192.168.1.10',
  },
  {
    id: 2,
    timestamp: '2023-03-09T16:35:20Z',
    user: 'admin',
    action: 'Camera Added',
    details: 'Added camera "Reception"',
  },
  {
    id: 3,
    timestamp: '2023-03-09T14:22:30Z',
    user: 'john',
    action: 'Camera Updated',
    details: 'Updated camera "Side Door" - Changed status to inactive',
  },
  {
    id: 4,
    timestamp: '2023-03-09T10:30:00Z',
    user: 'user',
    action: 'User Login',
    details: 'Logged in from 192.168.1.20',
  },
  {
    id: 5,
    timestamp: '2023-03-08T14:45:00Z',
    user: 'john',
    action: 'User Login',
    details: 'Logged in from 192.168.1.15',
  },
  {
    id: 6,
    timestamp: '2023-03-08T11:10:05Z',
    user: 'admin',
    action: 'System Update',
    details: 'Updated system to version 1.2.0',
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: 1,
    name: 'Camera Status Report',
    generatedOn: '2023-03-09T17:10:05Z',
    type: 'Camera Status',
    format: 'PDF',
    url: '/reports/camera_status_20230309.pdf',
  },
  {
    id: 2,
    name: 'User Activity Report',
    generatedOn: '2023-03-08T14:45:00Z',
    type: 'User Activity',
    format: 'CSV',
    url: '/reports/user_activity_20230308.csv',
  },
  {
    id: 3,
    name: 'System Health Report',
    generatedOn: '2023-03-07T11:30:00Z',
    type: 'System Health',
    format: 'PDF',
    url: '/reports/system_health_20230307.pdf',
  },
];

// Report Types
export const reportTypes = [
  'Camera Status',
  'User Activity',
  'System Health',
  'Security Events',
  'Storage Analysis',
];

// Helper functions
export const getNextId = <T extends { id: number }>(collection: T[]): number => {
  return Math.max(...collection.map(item => item.id), 0) + 1;
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
}; 