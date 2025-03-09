import { Camera, ApiResponse, PaginatedResponse, CameraFilters } from './types';
import { mockCameras, getNextId, getCurrentTimestamp } from './mockData';

// In-memory store of cameras (to simulate a database)
let cameras = [...mockCameras];

// Helper function to log activity
const logCameraActivity = (action: string, details: string) => {
  // In a real implementation, this would call an API endpoint
  console.log(`Activity Log: ${action} - ${details}`);
};

// Get all cameras (with optional filters)
export const getCameras = async (
  filters?: CameraFilters
): Promise<ApiResponse<PaginatedResponse<Camera>>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    let filteredCameras = [...cameras];

    // Apply filters
    if (filters) {
      if (filters.active !== undefined) {
        filteredCameras = filteredCameras.filter(camera => camera.active === filters.active);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCameras = filteredCameras.filter(
          camera =>
            camera.name.toLowerCase().includes(searchLower) ||
            camera.location.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCameras = filteredCameras.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedCameras,
        total: filteredCameras.length,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error getting cameras:', error);
    return {
      success: false,
      error: 'Failed to fetch cameras. Please try again.',
    };
  }
};

// Get a single camera by ID
export const getCameraById = async (id: number): Promise<ApiResponse<Camera>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const camera = cameras.find(c => c.id === id);

    if (!camera) {
      return {
        success: false,
        error: `Camera with ID ${id} not found.`,
      };
    }

    return {
      success: true,
      data: camera,
    };
  } catch (error) {
    console.error(`Error getting camera ${id}:`, error);
    return {
      success: false,
      error: 'Failed to fetch camera details. Please try again.',
    };
  }
};

// Create a new camera
export const createCamera = async (cameraData: Omit<Camera, 'id'>): Promise<ApiResponse<Camera>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));

  try {
    const newCamera: Camera = {
      ...cameraData,
      id: getNextId(cameras),
      lastSeen: getCurrentTimestamp(),
    };

    cameras.push(newCamera);

    // Log activity
    logCameraActivity('Added Camera', `Added Camera ${newCamera.id} (${newCamera.name})`);

    return {
      success: true,
      data: newCamera,
    };
  } catch (error) {
    console.error('Error creating camera:', error);
    return {
      success: false,
      error: 'Failed to create camera. Please try again.',
    };
  }
};

// Update an existing camera
export const updateCamera = async (id: number, cameraData: Partial<Camera>): Promise<ApiResponse<Camera>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    const index = cameras.findIndex(c => c.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `Camera with ID ${id} not found.`,
      };
    }

    const updatedCamera = {
      ...cameras[index],
      ...cameraData,
    };

    cameras[index] = updatedCamera;

    // Log activity
    let activityDetails = `Updated Camera ${id} (${updatedCamera.name})`;
    if (cameraData.active !== undefined) {
      activityDetails = `${cameraData.active ? 'Enabled' : 'Disabled'} Camera ${id} (${updatedCamera.name})`;
    }
    logCameraActivity('Updated Camera', activityDetails);

    return {
      success: true,
      data: updatedCamera,
    };
  } catch (error) {
    console.error(`Error updating camera ${id}:`, error);
    return {
      success: false,
      error: 'Failed to update camera. Please try again.',
    };
  }
};

// Delete a camera
export const deleteCamera = async (id: number): Promise<ApiResponse<void>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const index = cameras.findIndex(c => c.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `Camera with ID ${id} not found.`,
      };
    }

    const cameraName = cameras[index].name;
    cameras = cameras.filter(c => c.id !== id);

    // Log activity
    logCameraActivity('Deleted Camera', `Deleted Camera ${id} (${cameraName})`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting camera ${id}:`, error);
    return {
      success: false,
      error: 'Failed to delete camera. Please try again.',
    };
  }
};

// Bulk update cameras (e.g., enable/disable multiple)
export const bulkUpdateCameras = async (
  ids: number[],
  update: Partial<Camera>
): Promise<ApiResponse<{ updated: number; failed: number }>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    let updatedCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      const index = cameras.findIndex(c => c.id === id);

      if (index !== -1) {
        cameras[index] = {
          ...cameras[index],
          ...update,
        };
        updatedCount++;
      } else {
        failedCount++;
      }
    }

    // Log activity
    let activityDetails = `Bulk updated ${updatedCount} cameras`;
    if (update.active !== undefined) {
      activityDetails = `${update.active ? 'Enabled' : 'Disabled'} ${updatedCount} cameras`;
    }
    logCameraActivity('Bulk Camera Update', activityDetails);

    return {
      success: true,
      data: {
        updated: updatedCount,
        failed: failedCount,
      },
    };
  } catch (error) {
    console.error('Error bulk updating cameras:', error);
    return {
      success: false,
      error: 'Failed to update cameras. Please try again.',
    };
  }
};

// Reset cameras to default (for testing purposes)
export const resetCameras = () => {
  cameras = [...mockCameras];
}; 