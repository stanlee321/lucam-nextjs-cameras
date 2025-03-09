import { ApiResponse, Camera, CameraFilters, PaginatedResponse } from './types';
import { apiClient } from './apiClient';
import { mockCameras, getNextId } from './mockData';

// This is a hybrid service that will use the API client when API_ENABLED is true,
// but fall back to mock data when it's false (for development without a backend)
const API_ENABLED = false;

class CameraService {
  /**
   * Get all cameras with optional filtering and pagination
   */
  async getCameras(filters?: CameraFilters): Promise<ApiResponse<PaginatedResponse<Camera>>> {
    if (API_ENABLED) {
      return apiClient.get<PaginatedResponse<Camera>>('/cameras', filters);
    }
    
    // Mock implementation
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
      return apiClient.get<Camera>(`/cameras/${id}`);
    }
    
    // Mock implementation
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
      return apiClient.post<Camera>('/cameras', cameraData);
    }
    
    // Mock implementation
    const newCamera: Camera = {
      id: getNextId(mockCameras),
      name: cameraData.name || 'New Camera',
      location: cameraData.location || 'Unknown',
      active: cameraData.active !== undefined ? cameraData.active : true,
      ipAddress: cameraData.ipAddress,
      port: cameraData.port || 554,
      lastSeen: null
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
      return apiClient.put<Camera>(`/cameras/${id}`, cameraData);
    }
    
    // Mock implementation
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
      return apiClient.delete<{ message: string, id: number }>(`/cameras/${id}`);
    }
    
    // Mock implementation
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
      return apiClient.patch<{ updated: number, cameras: number[] }>('/cameras/bulk-update', { ids, updates });
    }
    
    // Mock implementation
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