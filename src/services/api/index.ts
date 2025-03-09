// Re-export all API services for easier imports

// Types
export * from './types';

// Services - Using direct exports to avoid namespace issues
export { cameraService } from './cameraService';
export { userService } from './userService';
export { activityLogService } from './activityLogService';
export { reportService } from './reportService';
export { authService } from './authService';
export { apiClient } from './apiClient';

// Mock data (exported for testing purposes)
export * from './mockData'; 