/**
 * Converts camelCase to snake_case for API requests
 * 
 * Example: convertToSnakeCase({ firstName: 'John' }) => { first_name: 'John' }
 */
export function convertToSnakeCase(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    // Skip undefined or null values
    if (data[key] === undefined || data[key] === null) {
      return;
    }
    
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Handle nested objects
    if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
      result[snakeKey] = convertToSnakeCase(data[key]);
    } else {
      result[snakeKey] = data[key];
    }
  });
  
  return result;
}

/**
 * Converts snake_case to camelCase for API responses
 * 
 * Example: convertToCamelCase({ first_name: 'John' }) => { firstName: 'John' }
 */
export function convertToCamelCase(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    // Skip undefined or null values
    if (data[key] === undefined || data[key] === null) {
      return;
    }
    
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Handle nested objects
    if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
      result[camelKey] = convertToCamelCase(data[key]);
    } else {
      result[camelKey] = data[key];
    }
  });
  
  return result;
}

/**
 * Processes an API response to convert snake_case keys to camelCase
 */
export function processCameraResponse<T>(response: any): T {
  // Skip if response is not an object or is null
  if (typeof response !== 'object' || response === null) {
    return response as T;
  }
  
  // If it's an array, process each item
  if (Array.isArray(response)) {
    return response.map(item => processCameraResponse<any>(item)) as unknown as T;
  }
  
  // Process paginated response structure
  if (response.data && Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map((item: any) => convertToCamelCase(item))
    } as T;
  }
  
  // Process single object response
  return convertToCamelCase(response) as T;
} 