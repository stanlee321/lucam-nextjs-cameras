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
      
      // IMPORTANT: Get auth token directly from localStorage to avoid any issues
      let token = null;
      
      // First try from authService
      token = authService.getToken();
      
      // Backup: try directly from localStorage if we're in a browser
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('lucam_auth_token');
        console.log(`[CAMERA SERVICE] Got token directly from localStorage: ${!!token}`);
      }
      
      // Set up headers with auth token
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        // Format exactly as per API docs: "Authorization: Bearer <your_jwt_token>"
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`[CAMERA SERVICE] Adding auth header for ${method} ${endpoint}`);
        console.log(`[CAMERA SERVICE] Token length: ${token.length}`);
        console.log(`[CAMERA SERVICE] Auth header: Bearer ${token.substring(0, 20)}...`);
      } else {
        console.error(`[CAMERA SERVICE] No auth token available for ${method} ${endpoint}`);
        
        // Special handling: try to get the token from localStorage directly
        const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('lucam_auth_token') : null;
        if (localStorageToken) {
          console.log('[CAMERA SERVICE] Found token in localStorage, using it');
          headers['Authorization'] = `Bearer ${localStorageToken}`;
        } else {
          return { 
            success: false, 
            error: 'Authentication required for camera operations' 
          };
        }
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
      const user = authService.getUser();
      console.log(`[CAMERA SERVICE] Making ${method} request to ${fullUrl}`);
      console.log(`[CAMERA SERVICE] User role:`, user?.role || 'Unknown');
      console.log(`[CAMERA SERVICE] Headers:`, {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? `Bearer ${headers['Authorization'].split(' ')[1]?.substring(0, 10)}...` : 'None'
      });
      
      if (method !== 'GET' && data) {
        console.log(`[CAMERA SERVICE] Request body:`, JSON.stringify(data));
      }
      
      try {
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(fullUrl, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        console.log(`[CAMERA SERVICE] Response status: ${response.status}`);
        
        // Get the response text
        const text = await response.text();
        console.log(`[CAMERA SERVICE] Raw response:`, text);
        
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
              error: errorData.error || errorData.message || `HTTP error ${response.status}: ${response.statusText}`
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
          console.log(`[CAMERA SERVICE] Parsed response:`, responseData);
          
          // Handle the nested response structure
          if (responseData.success === true && responseData.data !== undefined) {
            // This is the structure from your API: { success: true, data: { ... } }
            return {
              success: true,
              data: responseData.data as T
            };
          } else if (Array.isArray(responseData)) {
            // Direct array response
            return {
              success: true,
              data: responseData as T
            };
          } else if (typeof responseData === 'object' && !('error' in responseData)) {
            // Direct object response
            return {
              success: true,
              data: responseData as T
            };
          } else if (responseData.error) {
            // Error response
            return {
              success: false,
              error: responseData.error
            };
          } else {
            // Unknown format
            console.error('[CAMERA SERVICE] Unexpected response format:', responseData);
            return {
              success: false,
              error: 'Invalid response format from server'
            };
          }
        } catch (e) {
          console.error('[CAMERA SERVICE] Error parsing JSON:', e);
          return {
            success: false,
            error: 'Invalid JSON response from server'
          };
        }
      } catch (error: any) {
        // Enhanced error logging
        console.error('[CAMERA SERVICE] Network error details:', {
          error: error.message,
          type: error.name,
          url: fullUrl,
          isAbortError: error.name === 'AbortError',
          stack: error.stack
        });

        // Check if it's a timeout
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timed out. Please check your connection and try again.'
          };
        }

        // Check if it's a network error
        if (error.message.includes('Failed to fetch')) {
          return {
            success: false,
            error: 'Unable to connect to the server. Please check your network connection and ensure the API server is running.'
          };
        }

        return {
          success: false,
          error: error.message || 'An unexpected network error occurred'
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
        const response = await this.directApiRequest<any>(
          'GET',
          '/cameras',
          undefined,
          filters
        );

        if (response.success && response.data) {
          console.log('[CAMERA SERVICE] Cameras response data:', response.data);
          
          // Handle the nested data structure
          if (response.data.data && Array.isArray(response.data.data)) {
            // Map the snake_case properties to camelCase
            const mappedCameras = response.data.data.map((camera: any) => ({
              id: camera.id,
              name: camera.name,
              location: camera.location,
              active: camera.active,
              ipAddress: camera.ip_address,
              port: camera.port,
              lastSeen: camera.last_seen,
              // Include any other properties needed
              createdAt: camera.created_at,
              updatedAt: camera.updated_at
            }));

            return {
              success: true,
              data: {
                data: mappedCameras,
                total: response.data.total || mappedCameras.length,
                page: response.data.page || filters?.page || 1,
                limit: response.data.limit || filters?.limit || 10
              }
            };
          } else if (Array.isArray(response.data)) {
            // If it's a direct array, map and wrap it
            const mappedCameras = response.data.map((camera: any) => ({
              id: camera.id,
              name: camera.name,
              location: camera.location,
              active: camera.active, 
              ipAddress: camera.ip_address,
              port: camera.port,
              lastSeen: camera.last_seen,
              // Include any other properties needed
              createdAt: camera.created_at,
              updatedAt: camera.updated_at
            }));

            return {
              success: true,
              data: {
                data: mappedCameras,
                total: mappedCameras.length,
                page: filters?.page || 1,
                limit: filters?.limit || mappedCameras.length
              }
            };
          }
        }
        
        // If we get here, something went wrong with the response format
        console.error('[CAMERA SERVICE] Invalid response format:', response);
        return {
          success: false,
          error: response.error || 'Invalid response format from server'
        };
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
        // Ensure we have an authentication token
        const token = authService.getToken();
        if (!token) {
          console.error('[CAMERA SERVICE] No authentication token available for camera creation');
          return {
            success: false,
            error: 'Authentication required to create a camera'
          };
        }

        // Check if the user has admin privileges (SuperAdmin or Admin)
        const user = authService.getUser();
        console.log('[CAMERA SERVICE] Current user role:', user?.role);
        
        if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Admin')) {
          console.error('[CAMERA SERVICE] User does not have required admin privileges');
          return {
            success: false,
            error: 'You do not have permission to create cameras. Admin access required.'
          };
        }

        // Format data for API (convert camelCase to snake_case) according to API docs
        const formattedData = {
          name: cameraData.name,
          location: cameraData.location,
          active: cameraData.active !== undefined ? cameraData.active : true,
          ip_address: cameraData.ipAddress,
          // Per API docs, port must be a number
          port: (() => {
            if (cameraData.port === undefined || cameraData.port === null) {
              return 554; // Default RTSP port if not specified
            }
            if (typeof cameraData.port === 'string') {
              const parsed = parseInt(cameraData.port);
              return isNaN(parsed) ? 554 : parsed;
            }
            return cameraData.port;
          })()
        };
        
        console.log('[CAMERA SERVICE] Creating camera with formatted data:', formattedData);
        
        // Add direct logging of the auth token (first 10 chars only for security)
        if (token) {
          const tokenPreview = token.substring(0, 10) + '...';
          console.log(`[CAMERA SERVICE] Using token for camera creation: ${tokenPreview}`);
        }
        
        // Use direct API request
        const response = await this.directApiRequest<any>(
          'POST',
          '/cameras',
          formattedData,
          undefined
        );
        
        console.log('[CAMERA SERVICE] Create camera response:', response);
        
        if (response.success && response.data) {
          // Map the snake_case response to camelCase for our frontend
          const mappedCamera = {
            id: response.data.id,
            name: response.data.name,
            location: response.data.location,
            active: response.data.active,
            ipAddress: response.data.ip_address,
            port: response.data.port,
            lastSeen: response.data.last_seen,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          };
          
          return {
            success: true,
            data: mappedCamera as Camera
          };
        } else if (response.error) {
          // Handle specific error messages from the API
          if (response.error.toLowerCase().includes('unauthorized') || 
              response.error.toLowerCase().includes('authentication')) {
            console.error('[CAMERA SERVICE] Authentication error during camera creation:', response.error);
            return {
              success: false,
              error: 'Authentication required. Please log in again.'
            };
          }
          
          if (response.error.toLowerCase().includes('permission') || 
              response.error.toLowerCase().includes('forbidden')) {
            console.error('[CAMERA SERVICE] Permission error during camera creation:', response.error);
            return {
              success: false,
              error: 'You do not have permission to create cameras. Admin access required.'
            };
          }
          
          console.error('[CAMERA SERVICE] Error during camera creation:', response.error);
          return {
            success: false,
            error: response.error
          };
        }
        
        return {
          success: false,
          error: 'Failed to create camera. Unknown error occurred.'
        };
      } catch (error) {
        console.error('[CAMERA SERVICE] Exception during camera creation:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create camera'
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
        // Ensure we have an authentication token
        const token = authService.getToken();
        if (!token) {
          return {
            success: false,
            error: 'Authentication required to update a camera'
          };
        }
        
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
        
        console.log(`[CAMERA SERVICE] Updating camera ${id} with data:`, formattedData);
        
        // Use direct API request
        const response = await this.directApiRequest<any>(
          'PUT',
          `/cameras/${id}`,
          formattedData,
          undefined
        );
        
        console.log(`[CAMERA SERVICE] Update camera response:`, response);
        
        if (response.success && response.data) {
          // Map the snake_case response to camelCase for our frontend
          const mappedCamera = {
            id: response.data.id,
            name: response.data.name,
            location: response.data.location,
            active: response.data.active,
            ipAddress: response.data.ip_address,
            port: response.data.port,
            lastSeen: response.data.last_seen,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          };
          
          return {
            success: true,
            data: mappedCamera as Camera
          };
        }
        
        return response;
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