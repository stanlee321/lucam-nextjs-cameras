import { User, ApiResponse, PaginatedResponse, UserFilters } from './types';
import { mockUsers, getNextId, getCurrentTimestamp } from './mockData';
import { apiClient } from './apiClient';

// Toggle API mode
const API_ENABLED = false;

// In-memory store of users (to simulate a database)
let users = [...mockUsers];

// Helper function to log activity
const logUserActivity = (action: string, details: string) => {
  // In a real implementation, this would call an API endpoint
  console.log(`Activity Log: ${action} - ${details}`);
};

class UserService {
  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> {
    if (API_ENABLED) {
      return apiClient.get<PaginatedResponse<User>>('/users', filters);
    }
    
    // Mock implementation
    const { page = 1, limit = 10, search = '', role, active } = filters || {};
    
    // Filter users based on search, role, and active status
    let filteredUsers = [...mockUsers];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (active !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.active === active);
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit
      }
    };
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    if (API_ENABLED) {
      return apiClient.get<User>(`/users/${id}`);
    }
    
    // Mock implementation
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    return {
      success: true,
      data: { ...user }
    };
  }
  
  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    if (API_ENABLED) {
      return apiClient.post<User>('/users', userData);
    }
    
    // Mock implementation
    if (!userData.username || !userData.name || !userData.role) {
      return {
        success: false,
        error: 'Username, name, and role are required'
      };
    }
    
    // Check if username is already taken
    if (mockUsers.some(u => u.username === userData.username)) {
      return {
        success: false,
        error: 'Username already exists'
      };
    }
    
    const newUser: User = {
      id: getNextId(mockUsers),
      username: userData.username,
      name: userData.name,
      role: userData.role,
      active: userData.active !== undefined ? userData.active : true,
      email: userData.email || undefined,
      lastLogin: userData.lastLogin || undefined
    };
    
    mockUsers.push(newUser);
    
    return {
      success: true,
      data: { ...newUser }
    };
  }
  
  /**
   * Update an existing user
   */
  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    if (API_ENABLED) {
      return apiClient.put<User>(`/users/${id}`, userData);
    }
    
    // Mock implementation
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Check if username is being changed and is already taken by another user
    if (userData.username && userData.username !== mockUsers[userIndex].username &&
        mockUsers.some(u => u.id !== id && u.username === userData.username)) {
      return {
        success: false,
        error: 'Username already exists'
      };
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      id // Ensure ID doesn't change
    };
    
    mockUsers[userIndex] = updatedUser;
    
    return {
      success: true,
      data: { ...updatedUser }
    };
  }
  
  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<ApiResponse<{ message: string, id: number }>> {
    if (API_ENABLED) {
      return apiClient.delete<{ message: string, id: number }>(`/users/${id}`);
    }
    
    // Mock implementation
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    mockUsers.splice(userIndex, 1);
    
    return {
      success: true,
      data: {
        message: 'User deleted successfully',
        id
      }
    };
  }
}

export const userService = new UserService();

// Get all users (with optional filters)
export const getUsers = async (
  filters?: UserFilters
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  try {
    let filteredUsers = [...users];

    // Apply filters
    if (filters) {
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      if (filters.active !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.active === filters.active);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user =>
            user.username.toLowerCase().includes(searchLower) ||
            user.name.toLowerCase().includes(searchLower) ||
            (user.email && user.email.toLowerCase().includes(searchLower))
        );
      }
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      success: false,
      error: 'Failed to fetch users. Please try again.',
    };
  }
};

// Get a single user by ID
export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const user = users.find(u => u.id === id);

    if (!user) {
      return {
        success: false,
        error: `User with ID ${id} not found.`,
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error(`Error getting user ${id}:`, error);
    return {
      success: false,
      error: 'Failed to fetch user details. Please try again.',
    };
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id' | 'lastLogin'>): Promise<ApiResponse<User>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      return {
        success: false,
        error: 'Username already exists. Please choose another username.',
      };
    }

    const newUser: User = {
      ...userData,
      id: getNextId(users),
      lastLogin: '',
    };

    users.push(newUser);

    // Log activity
    logUserActivity('Created User', `User account "${newUser.username}" (Role: ${newUser.role})`);

    return {
      success: true,
      data: newUser,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Failed to create user. Please try again.',
    };
  }
};

// Update an existing user
export const updateUser = async (id: number, userData: Partial<User>): Promise<ApiResponse<User>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `User with ID ${id} not found.`,
      };
    }

    // Check if updating username and it already exists
    if (
      userData.username &&
      userData.username !== users[index].username &&
      users.some(u => u.username.toLowerCase() === userData.username!.toLowerCase())
    ) {
      return {
        success: false,
        error: 'Username already exists. Please choose another username.',
      };
    }

    const updatedUser = {
      ...users[index],
      ...userData,
    };

    users[index] = updatedUser;

    // Log activity
    let activityDetails = `Updated User ${updatedUser.username}`;
    if (userData.role && userData.role !== users[index].role) {
      activityDetails = `Changed role for ${updatedUser.username} to ${userData.role}`;
    } else if (userData.active !== undefined && userData.active !== users[index].active) {
      activityDetails = `${userData.active ? 'Activated' : 'Deactivated'} user ${updatedUser.username}`;
    }
    logUserActivity('Updated User', activityDetails);

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    return {
      success: false,
      error: 'Failed to update user. Please try again.',
    };
  }
};

// Delete a user
export const deleteUser = async (id: number): Promise<ApiResponse<void>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `User with ID ${id} not found.`,
      };
    }

    // Check if it's the last super admin (don't allow deletion)
    if (
      users[index].role === 'SuperAdmin' &&
      users.filter(u => u.role === 'SuperAdmin').length <= 1
    ) {
      return {
        success: false,
        error: 'Cannot delete the last Super Admin account.',
      };
    }

    const username = users[index].username;
    users = users.filter(u => u.id !== id);

    // Log activity
    logUserActivity('Deleted User', `Deleted User account "${username}"`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    return {
      success: false,
      error: 'Failed to delete user. Please try again.',
    };
  }
};

// Simulate user login (updates lastLogin timestamp)
export const loginUser = async (username: string, password: string): Promise<ApiResponse<User>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    // In a real app, you would check password hash, etc.
    // Here we just check if the user exists
    const userIndex = users.findIndex(
      u => u.username.toLowerCase() === username.toLowerCase() && u.active
    );

    if (userIndex === -1) {
      return {
        success: false,
        error: 'Invalid username or password.',
      };
    }

    // Update last login time
    const updatedUser = {
      ...users[userIndex],
      lastLogin: getCurrentTimestamp(),
    };

    users[userIndex] = updatedUser;

    // Log activity
    logUserActivity('Logged In', `User ${username} logged in`);

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      error: 'Failed to log in. Please try again.',
    };
  }
};

// Reset users to default (for testing purposes)
export const resetUsers = () => {
  users = [...mockUsers];
}; 