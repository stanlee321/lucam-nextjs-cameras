import { ApiResponse } from './types';
import { authService } from './authService';

// The base URL for API calls
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lucam-system.com/v1';

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Generic request method using native fetch
const request = async <T>(
  method: string,
  url: string,
  data?: any,
  params?: any
): Promise<ApiResponse<T>> => {
  try {
    // Build the complete URL with query parameters
    let fullUrl = `${BASE_URL}${url}`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    
    // Prepare headers with authentication if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (isBrowser) {
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Configure request options
    const options: RequestInit = {
      method,
      headers,
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(fullUrl, options);
    
    // Handle 401 Unauthorized errors
    if (response.status === 401 && isBrowser) {
      authService.logout();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    
    // Parse JSON response
    const responseData = await response.json();
    
    // Return response in our standard format
    return responseData;
  } catch (error: any) {
    // Handle errors
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

// API client with methods for each HTTP verb
export const apiClient = {
  get: <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    return request<T>('GET', url, undefined, params);
  },
  
  post: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return request<T>('POST', url, data);
  },
  
  put: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return request<T>('PUT', url, data);
  },
  
  patch: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return request<T>('PATCH', url, data);
  },
  
  delete: <T>(url: string): Promise<ApiResponse<T>> => {
    return request<T>('DELETE', url);
  },
};

export default apiClient; 