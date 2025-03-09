import { ApiResponse } from './types';
import { authService } from './authService';
import { convertToSnakeCase, convertToCamelCase } from './utils';

// Get environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

// Base URL for API calls with version
const BASE_URL = `${API_URL}/${API_VERSION}`;

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Improve error message formatting to be more user-friendly
function formatErrorMessage(errorText: string): string {
  // Check for JSON deserialization errors and format them nicely
  if (errorText.includes('Json deserialize error')) {
    // Extract the error details
    const match = errorText.match(/Json deserialize error: (.*?) at line/);
    if (match && match[1]) {
      const errorDetail = match[1];
      
      // Handle specific error types
      if (errorDetail.includes('expected u16')) {
        return 'Port must be a valid number between 1 and 65535';
      }
      
      // For other deserialization errors, return a cleaner message
      return `Invalid data format: ${errorDetail}`;
    }
  }
  
  // Return the original error if no specific formatting is needed
  return errorText;
}

// Generic request method using native fetch
const request = async <T>(
  method: string,
  endpoint: string,
  data?: any,
  params?: any
): Promise<ApiResponse<T>> => {
  try {
    // Build the complete URL with query parameters
    let fullUrl = `${BASE_URL}${endpoint}`;
    
    if (params) {
      // Convert camelCase params to snake_case for API
      const snakeCaseParams = convertToSnakeCase(params);
      const queryParams = new URLSearchParams();
      
      Object.entries(snakeCaseParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
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
      // Add a timeout
      signal: AbortSignal.timeout(API_TIMEOUT),
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      // Convert camelCase data to snake_case for API
      const snakeCaseData = convertToSnakeCase(data);
      options.body = JSON.stringify(snakeCaseData);
    }
    
    // Make the request
    const response = await fetch(fullUrl, options);
    console.log(`API ${method} ${endpoint}:`, response.status, response.statusText);
    
    // Handle different HTTP status codes
    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401 && isBrowser) {
        console.error('Authentication failed - redirecting to login');
        authService.logout();
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
      
      // Try to parse error response
      try {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || `HTTP error ${response.status}: ${response.statusText}`;
        } catch (e) {
          // If not JSON, use the raw text
          errorMessage = errorText || `HTTP error ${response.status}: ${response.statusText}`;
        }
        
        // Format the error message to be more user-friendly
        const formattedError = formatErrorMessage(errorMessage);
        
        console.error('API error:', {
          status: response.status,
          raw: errorText,
          formatted: formattedError
        });
        
        return {
          success: false,
          error: formattedError
        };
      } catch (e) {
        return {
          success: false,
          error: `HTTP error ${response.status}: ${response.statusText}`
        };
      }
    }
    
    // First check if there's content to parse
    const text = await response.text();
    if (!text) {
      return { success: false, error: 'Empty response from server' };
    }
    
    console.log('Raw response text:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    
    try {
      const responseData = JSON.parse(text);
      
      // Convert snake_case response to camelCase for frontend
      // Only convert the data part, keep success and error as is
      if (responseData.success && responseData.data) {
        try {
          // If it's a paginated response
          if (responseData.data.data && Array.isArray(responseData.data.data)) {
            responseData.data.data = responseData.data.data.map(
              (item: any) => convertToCamelCase(item)
            );
          } 
          // If it's a single object
          else if (typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
            responseData.data = convertToCamelCase(responseData.data);
          }
        } catch (conversionError) {
          console.error('Error converting case in response:', conversionError);
          // Continue with the response even if conversion fails
        }
      }
      
      // Return response in our standard format
      return responseData;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError, 'Response text:', text);
      return {
        success: false,
        error: 'Invalid JSON response from server'
      };
    }
  } catch (error: any) {
    // Handle errors
    console.error('API request error:', error);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout - server took too long to respond'
      };
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

// API client with methods for each HTTP verb
export const apiClient = {
  get: <T>(endpoint: string, params?: any): Promise<ApiResponse<T>> => {
    return request<T>('GET', endpoint, undefined, params);
  },
  
  post: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return request<T>('POST', endpoint, data);
  },
  
  put: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return request<T>('PUT', endpoint, data);
  },
  
  patch: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return request<T>('PATCH', endpoint, data);
  },
  
  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return request<T>('DELETE', endpoint);
  },
};

export default apiClient; 