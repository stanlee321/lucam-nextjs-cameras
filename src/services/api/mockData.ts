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
    name: 'Loading Dock',
    location: 'Warehouse',
    active: true,
    ipAddress: '192.168.1.105',
    port: 8000,
    lastSeen: '2023-03-09T11:10:05Z',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'adminUser1',
    name: 'Alice Admin',
    role: 'SuperAdmin',
    lastLogin: '2023-03-08T14:22:30Z',
    active: true,
    email: 'alice@example.com',
  },
  {
    id: 2,
    username: 'jdoe',
    name: 'John Doe',
    role: 'Viewer',
    lastLogin: '2023-03-09T09:10:15Z',
    active: true,
    email: 'john@example.com',
  },
  {
    id: 3,
    username: 'asmith',
    name: 'Alice Smith',
    role: 'Admin',
    lastLogin: '2023-03-04T17:45:22Z',
    active: true,
    email: 'asmith@example.com',
  },
  {
    id: 4,
    username: 'mjohnson',
    name: 'Mark Johnson',
    role: 'Admin',
    lastLogin: '2023-03-07T08:30:40Z',
    active: false,
    email: 'mjohnson@example.com',
  },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 1,
    timestamp: '2023-03-09T21:05:30Z',
    user: 'adminUser1',
    action: 'Edited Camera',
    details: 'Changed name to "Lobby"',
  },
  {
    id: 2,
    timestamp: '2023-03-09T20:57:10Z',
    user: 'asmith',
    action: 'Generated Report',
    details: '"Monthly Usage" Report (March 2023)',
  },
  {
    id: 3,
    timestamp: '2023-03-09T20:45:00Z',
    user: 'adminUser1',
    action: 'Disabled Camera',
    details: 'Camera 102 (Side Door)',
  },
  {
    id: 4,
    timestamp: '2023-03-09T20:30:15Z',
    user: 'adminUser1',
    action: 'Created User',
    details: 'User account "jdoe" (Role: Viewer)',
  },
  {
    id: 5,
    timestamp: '2023-03-09T19:15:20Z',
    user: 'asmith',
    action: 'Logged In',
    details: 'IP: 192.168.1.45',
  },
  {
    id: 6,
    timestamp: '2023-03-09T18:22:10Z',
    user: 'adminUser1',
    action: 'Added Camera',
    details: 'Added Camera 105 (Loading Dock)',
  },
  {
    id: 7,
    timestamp: '2023-03-09T17:10:05Z',
    user: 'mjohnson',
    action: 'Bulk Camera Update',
    details: 'Enabled 3 cameras',
  },
  {
    id: 8,
    timestamp: '2023-03-09T16:45:30Z',
    user: 'adminUser1',
    action: 'System Settings',
    details: 'Updated server configuration',
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: 1,
    name: 'Usage_Summary_Mar_2023',
    generatedOn: '2023-03-01T00:00:00Z',
    type: 'Usage Summary',
    format: 'PDF',
    url: '/reports/Usage_Summary_Mar_2023.pdf',
  },
  {
    id: 2,
    name: 'Camera_Status_Report_Q1',
    generatedOn: '2023-03-01T00:00:00Z',
    type: 'Camera Status',
    format: 'CSV',
    url: '/reports/Camera_Status_Report_Q1.csv',
  },
  {
    id: 3,
    name: 'User_Activity_Feb_2023',
    generatedOn: '2023-03-01T00:00:00Z',
    type: 'User Activity',
    format: 'PDF',
    url: '/reports/User_Activity_Feb_2023.pdf',
  },
  {
    id: 4,
    name: 'System_Health_Report',
    generatedOn: '2023-03-08T08:15:00Z',
    type: 'System Health',
    format: 'PDF',
    url: '/reports/System_Health_Report.pdf',
  },
];

// Mock Report Types
export const reportTypes = [
  'Usage Summary',
  'Camera Status',
  'User Activity',
  'System Health',
  'Access Log',
];

// Function to create a new unique ID for a given collection
export const getNextId = <T extends { id: number }>(collection: T[]): number => {
  return Math.max(...collection.map(item => item.id), 0) + 1;
};

// Function to get a timestamp for the current time
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
}; 