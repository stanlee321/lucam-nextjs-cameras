import { ApiResponse, Camera, CameraFilters, PaginatedResponse } from './types';
import { apiClient } from './apiClient';
import { mockCameras, getNextId } from './mockData';

// API integration enabled flag (from environment variables)
const API_ENABLED = process.env.NEXT_PUBLIC_API_ENABLED === 'true';

class CameraService {
  /**
   * Get all cameras with optional filtering and pagination
   */
  async getCameras(filters?: CameraFilters): Promise<ApiResponse<PaginatedResponse<Camera>>> {
    if (API_ENABLED) {
      try {
        // Call the real API
        return await apiClient.get<PaginatedResponse<Camera>>('/cameras', filters);
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
        // Call the real API
        return await apiClient.get<Camera>(`/cameras/${id}`);
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
        console.log('Creating camera with data:', cameraData);
        
        // Call the real API
        const response = await apiClient.post<Camera>('/cameras', cameraData);
        
        // Log response for debugging
        console.log('API response:', response);
        
        return response;
      } catch (error) {
        console.error('Error creating camera:', error);
        if (error instanceof Error) {
          return {
            success: false,
            error: `Failed to create camera: ${error.message}`
          };
        }
        return {
          success: false,
          error: 'Failed to create camera: Unknown error'
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
        // Call the real API
        return await apiClient.put<Camera>(`/cameras/${id}`, cameraData);
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
        // Call the real API
        return await apiClient.delete<{ message: string, id: number }>(`/cameras/${id}`);
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
        // Call the real API
        const data = {
          ids,
          updates
        };
        
        return await apiClient.patch<{ updated: number, cameras: number[] }>('/cameras/bulk-update', data);
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