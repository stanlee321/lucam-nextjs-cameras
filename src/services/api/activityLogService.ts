import { ActivityLog, ApiResponse, PaginatedResponse, ActivityLogFilters } from './types';
import { mockActivityLogs, getNextId, getCurrentTimestamp } from './mockData';
import { apiClient } from './apiClient';

// Toggle API mode
const API_ENABLED = false;

// In-memory store of activity logs (to simulate a database)
let activityLogs = [...mockActivityLogs];

// Get activity logs (with optional filters)
export const getActivityLogs = async (
  filters?: ActivityLogFilters
): Promise<ApiResponse<PaginatedResponse<ActivityLog>>> => {
  if (API_ENABLED) {
    return apiClient.get<PaginatedResponse<ActivityLog>>('/activity-logs', filters);
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    let filteredLogs = [...activityLogs];

    // Apply filters
    if (filters) {
      if (filters.user) {
        filteredLogs = filteredLogs.filter(log => 
          log.user.toLowerCase() === filters.user!.toLowerCase()
        );
      }

      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action!.toLowerCase())
        );
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        // Include the entire end date by setting it to the end of the day
        endDate.setHours(23, 59, 59, 999);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLogs = filteredLogs.filter(
          log =>
            log.user.toLowerCase().includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower) ||
            (log.details && log.details.toLowerCase().includes(searchLower))
        );
      }
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedLogs,
        total: filteredLogs.length,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return {
      success: false,
      error: 'Failed to fetch activity logs. Please try again.',
    };
  }
};

// Add a new activity log entry
export const addActivityLog = async (
  user: string,
  action: string,
  details?: string
): Promise<ApiResponse<ActivityLog>> => {
  try {
    const newLog: ActivityLog = {
      id: getNextId(activityLogs),
      timestamp: getCurrentTimestamp(),
      user,
      action,
      details,
    };

    activityLogs.unshift(newLog); // Add to the beginning of the array

    return {
      success: true,
      data: newLog,
    };
  } catch (error) {
    console.error('Error adding activity log:', error);
    return {
      success: false,
      error: 'Failed to log activity. Please try again.',
    };
  }
};

// Clear activity logs (for admin use or testing)
export const clearActivityLogs = async (): Promise<ApiResponse<void>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    activityLogs = [];

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return {
      success: false,
      error: 'Failed to clear activity logs. Please try again.',
    };
  }
};

// Export logs (in a real app, this would return a file)
export const exportActivityLogs = async (
  format: 'CSV' | 'PDF',
  filters?: ActivityLogFilters
): Promise<ApiResponse<string>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    // In a real implementation, this would generate a file
    // Here we just return a mock URL
    const filename = `activity_logs_export_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`;

    return {
      success: true,
      data: `/exports/${filename}`,
    };
  } catch (error) {
    console.error(`Error exporting activity logs as ${format}:`, error);
    return {
      success: false,
      error: `Failed to export activity logs as ${format}. Please try again.`,
    };
  }
};

// Reset activity logs to default (for testing purposes)
export const resetActivityLogs = () => {
  activityLogs = [...mockActivityLogs];
};

class ActivityLogService {
  /**
   * Get unique action types for filtering
   */
  async getActionTypes(): Promise<ApiResponse<string[]>> {
    if (API_ENABLED) {
      return apiClient.get<string[]>('/activity-logs/actions');
    }
    
    // Mock implementation
    const uniqueActions = Array.from(new Set(mockActivityLogs.map(log => log.action)));
    
    return {
      success: true,
      data: uniqueActions
    };
  }
  
  /**
   * Get unique users for filtering
   */
  async getUsers(): Promise<ApiResponse<string[]>> {
    if (API_ENABLED) {
      return apiClient.get<string[]>('/activity-logs/users');
    }
    
    // Mock implementation
    const uniqueUsers = Array.from(new Set(mockActivityLogs.map(log => log.user)));
    
    return {
      success: true,
      data: uniqueUsers
    };
  }
}

export const activityLogService = new ActivityLogService(); 