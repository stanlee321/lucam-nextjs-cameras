import { ApiResponse, Camera, CameraFilters, PaginatedResponse } from './types';
import { apiClient } from './apiClient';
import { authService } from './authService'; // Direct import
import { mockCameras, getNextId } from './mockData';

// API integration enabled flag (from environment variables)
const API_ENABLED = process.env.NEXT_PUBLIC_API_ENABLED === 'true';

class CameraService {
  /**
   * Special direct API method for cameras to bypass circular dependency issues
   */
  private async directApiRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Build the full URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081';
      const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
      const BASE_URL = `${API_URL}/${API_VERSION}`;
      
      let fullUrl = `${BASE_URL}${endpoint}`;
      
      // Add query parameters if provided
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          fullUrl += `?${queryString}`;
        }
      }
      
      // Get auth token directly from authService
      const token = authService.getToken();
      
      // Set up headers with auth token
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        // Format exactly as per API docs: "Authorization: Bearer <your_jwt_token>"
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`[CAMERA SERVICE] Adding auth header for ${method} ${endpoint}`);
        console.log(`[CAMERA SERVICE] Token length: ${token.length}`);
        console.log(`[CAMERA SERVICE] Auth header: Bearer ${token.substring(0, 15)}...`);
      } else {
        console.error(`[CAMERA SERVICE] No auth token available for ${method} ${endpoint}`);
        return { 
          success: false, 
          error: 'Authentication required for camera operations' 
        };
      }
      
      // Set up request options
      const options: RequestInit = {
        method,
        headers,
      };
      
      // Add body for non-GET requests
      if (method !== 'GET' && data) {
        // Log the data being sent for debugging
        console.log(`[CAMERA SERVICE] Sending data:`, data);
        options.body = JSON.stringify(data);
      }
      
      // Make the request
      console.log(`[CAMERA SERVICE] Making ${method} request to ${fullUrl}`);
      const response = await fetch(fullUrl, options);
      console.log(`[CAMERA SERVICE] Response status: ${response.status}`);
      
      // Get the response text
      const text = await response.text();
      console.log(`[CAMERA SERVICE] Raw response (first 100 chars): ${text.substring(0, 100)}`);
      
      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401) {
          console.error('[CAMERA SERVICE] Authentication failed (401)');
          return {
            success: false,
            error: 'Authentication required. Please log in again.'
          };
        }
        
        // Try to parse the error response
        try {
          const errorData = JSON.parse(text);
          return {
            success: false,
            error: errorData.error || `HTTP error ${response.status}: ${response.statusText}`
          };
        } catch (e) {
          // If not JSON, use the text
          return {
            success: false,
            error: text || `HTTP error ${response.status}: ${response.statusText}`
          };
        }
      }
      
      // Parse response
      if (!text) {
        return { success: false, error: 'Empty response from server' };
      }
      
      try {
        const responseData = JSON.parse(text);
        console.log(`[CAMERA SERVICE] Parsed response:`, {
          success: responseData.success,
          hasData: !!responseData.data,
          error: responseData.error
        });
        return responseData;
      } catch (e) {
        console.error('[CAMERA SERVICE] Error parsing JSON:', e);
        return {
          success: false,
          error: 'Invalid JSON response from server'
        };
      }
    } catch (error: any) {
      console.error('[CAMERA SERVICE] Request error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get all cameras with optional filtering and pagination
   */
  async getCameras(filters?: CameraFilters): Promise<ApiResponse<PaginatedResponse<Camera>>> {
    if (API_ENABLED) {
      try {
        // Use direct API request to avoid potential circular dependency issues
        return await this.directApiRequest<PaginatedResponse<Camera>>(
          'GET',
          '/cameras',
          undefined,
          filters
        );
      } catch (error) {
        console.error('Error fetching cameras:', error);
        return {
          success: false,
          error: 'Failed to fetch cameras from the server'
        };
      }
    }
    
    // Mock implementation
    console.log('Using mock camera data (API_ENABLED is false)');
    const { page = 1, limit = 10, search = '', active } = filters || {};
    
    // Filter cameras based on search and active status
    let filteredCameras = [...mockCameras];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCameras = filteredCameras.filter(camera => 
        camera.name.toLowerCase().includes(searchLower) || 
        camera.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (active !== undefined) {
      filteredCameras = filteredCameras.filter(camera => camera.active === active);
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCameras = filteredCameras.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedCameras,
        total: filteredCameras.length,
        page,
        limit
      }
    };
  }
  
  /**
   * Get a camera by ID
   */
  async getCameraById(id: number): Promise<ApiResponse<Camera>> {
    if (API_ENABLED) {
      try {
        // Use direct API request
        return await this.directApiRequest<Camera>(
          'GET',
          `/cameras/${id}`,
          undefined,
          undefined
        );
      } catch (error) {
        console.error(`Error fetching camera with ID ${id}:`, error);
        return {
          success: false,
          error: `Failed to fetch camera with ID ${id}`
        };
      }
    }
    
    // Mock implementation
    console.log('Using mock camera data (API_ENABLED is false)');
    const camera = mockCameras.find(c => c.id === id);
    
    if (!camera) {
      return {
        success: false,
        error: 'Camera not found'
      };
    }
    
    return {
      success: true,
      data: { ...camera }
    };
  }
  
  /**
   * Create a new camera
   */
  async createCamera(cameraData: Partial<Camera>): Promise<ApiResponse<Camera>> {
    if (API_ENABLED) {
      try {
        // Use direct API request
        // Convert camelCase to snake_case for API
        const formattedData = {
          name: cameraData.name,
          location: cameraData.location,
          active: cameraData.active !== undefined ? cameraData.active : true,
          ip_address: cameraData.ipAddress,
          port: typeof cameraData.port === 'string' ? parseInt(cameraData.port) : cameraData.port || 554,
        };
        
        return await this.directApiRequest<Camera>(
          'POST',
          '/cameras',
          formattedData,
          undefined
        );
      } catch (error) {
        console.error('Error creating camera:', error);
        return {
          success: false,
          error: 'Failed to create camera'
        };
      }
    }
    
    // Mock implementation
    console.log('Using mock camera data (API_ENABLED is false)');
    const newCamera: Camera = {
      id: getNextId(mockCameras),
      name: cameraData.name || 'New Camera',
      location: cameraData.location || 'Unknown',
      active: cameraData.active !== undefined ? cameraData.active : true,
      ipAddress: cameraData.ipAddress,
      port: cameraData.port || 554,
      lastSeen: undefined
    };
    
    mockCameras.push(newCamera);
    
    return {
      success: true,
      data: { ...newCamera }
    };
  }
  
  /**
   * Update an existing camera
   */
  async updateCamera(id: number, cameraData: Partial<Camera>): Promise<ApiResponse<Camera>> {
    if (API_ENABLED) {
      try {
        // Use direct API request
        // Convert camelCase to snake_case for API
        const formattedData: Record<string, any> = {};
        
        if (cameraData.name !== undefined) formattedData.name = cameraData.name;
        if (cameraData.location !== undefined) formattedData.location = cameraData.location;
        if (cameraData.active !== undefined) formattedData.active = cameraData.active;
        if (cameraData.ipAddress !== undefined) formattedData.ip_address = cameraData.ipAddress;
        if (cameraData.port !== undefined) {
          formattedData.port = typeof cameraData.port === 'string' 
            ? parseInt(cameraData.port) 
            : cameraData.port;
        }
        
        return await this.directApiRequest<Camera>(
          'PUT',
          `/cameras/${id}`,
          formattedData,
          undefined
        );
      } catch (error) {
        console.error(`Error updating camera with ID ${id}:`, error);
        return {
          success: false,
          error: `Failed to update camera with ID ${id}`
        };
      }
    }
    
    // Mock implementation
    console.log('Using mock camera data (API_ENABLED is false)');
    const cameraIndex = mockCameras.findIndex(c => c.id === id);
    
    if (cameraIndex === -1) {
      return {
        success: false,
        error: 'Camera not found'
      };
    }
    
    const updatedCamera = {
      ...mockCameras[cameraIndex],
      ...cameraData,
      id // Ensure ID doesn't change
    };
    
    mockCameras[cameraIndex] = updatedCamera;
    
    return {
      success: true,
      data: { ...updatedCamera }
    };
  }
  
  /**
   * Delete a camera
   */
  async deleteCamera(id: number): Promise<ApiResponse<{ message: string, id: number }>> {
    if (API_ENABLED) {
      try {
        // Use direct API request
        return await this.directApiRequest<{ message: string, id: number }>(
          'DELETE',
          `/cameras/${id}`,
          undefined,
          undefined
        );
      } catch (error) {
        console.error(`Error deleting camera with ID ${id}:`, error);
        return {
          success: false,
          error: `Failed to delete camera with ID ${id}`
        };
      }
    }
    
    // Mock implementation
    console.log('Using mock camera data (API_ENABLED is false)');
    const cameraIndex = mockCameras.findIndex(c => c.id === id);
    
    if (cameraIndex === -1) {
      return {
        success: false,
        error: 'Camera not found'
      };
    }
    
    mockCameras.splice(cameraIndex, 1);
    
    return {
      success: true,
      data: {
        message: 'Camera deleted successfully',
        id
      }
    };
  }
  
  /**
   * Bulk update cameras (e.g., to change active status for multiple cameras)
   */
  async bulkUpdateCameras(ids: number[], updates: Partial<Camera>): Promise<ApiResponse<{ updated: number, cameras: number[] }>> {
    if (API_ENABLED) {
      try {
        // Use direct API request
        // Convert camelCase to snake_case for API
        const formattedUpdates: Record<string, any> = {};
        
        if (updates.active !== undefined) formattedUpdates.active = updates.active;
        if (updates.location !== undefined) formattedUpdates.location = updates.location;
        if (updates.ipAddress !== undefined) formattedUpdates.ip_address = updates.ipAddress;
        if (updates.port !== undefined) {
          formattedUpdates.port = typeof updates.port === 'string' 
            ? parseInt(updates.port) 
            : updates.port;
        }
        
        const data = {
          ids,
          updates: formattedUpdates
        };
        
        return await this.directApiRequest<{ updated: number, cameras: number[] }>(
          'PATCH',
          '/cameras/bulk-update',
          data,
          undefined
        );
      } catch (error) {
        console.error('Error performing bulk update:', error);
        return {
          success: false,
          error: 'Failed to update cameras'
        };
      }
    }
    
    // Mock implementation
    console.log('Using mock camera data (API_ENABLED is false)');
    const updatedIds: number[] = [];
    
    ids.forEach(id => {
      const cameraIndex = mockCameras.findIndex(c => c.id === id);
      
      if (cameraIndex !== -1) {
        mockCameras[cameraIndex] = {
          ...mockCameras[cameraIndex],
          ...updates,
          id // Ensure ID doesn't change
        };
        updatedIds.push(id);
      }
    });
    
    return {
      success: true,
      data: {
        updated: updatedIds.length,
        cameras: updatedIds
      }
    };
  }
}

export const cameraService = new CameraService(); 