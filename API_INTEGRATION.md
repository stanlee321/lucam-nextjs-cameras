# API Integration Guide

This document explains how the LucaM Camera System frontend integrates with the backend API.

## Configuration

The API integration is configured through environment variables in the `.env.local` file:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_API_ENABLED=true
```

- `NEXT_PUBLIC_API_URL`: The base URL of the API server
- `NEXT_PUBLIC_API_VERSION`: The API version to use
- `NEXT_PUBLIC_API_TIMEOUT`: Request timeout in milliseconds
- `NEXT_PUBLIC_API_ENABLED`: Set to `true` to use the real API, `false` to use mock data

## Authentication Flow

1. The user enters credentials on the login page
2. The `authService.login()` method sends a POST request to `/auth/login`
3. On successful login, the API returns a JWT token and user information
4. The token is stored in localStorage and automatically added to subsequent API requests
5. Protected pages check authentication through `useAuth()` hook
6. If authentication fails (401 error), the user is redirected to the login page

## API Client

The `apiClient.ts` file provides a unified interface for API requests:

- Handles authentication headers
- Formats request data (camelCase to snake_case)
- Processes response data (snake_case to camelCase)
- Manages error handling and timeouts

Example usage:

```typescript
// Get all cameras
const response = await apiClient.get<PaginatedResponse<Camera>>('/cameras', {
  page: 1,
  limit: 10,
  search: 'Office'
});

// Create a new camera
const createResponse = await apiClient.post<Camera>('/cameras', {
  name: 'New Camera',
  location: 'Front Door',
  active: true,
  ipAddress: '192.168.1.100',
  port: 554
});
```

## Hybrid Mode

The services support both real API and mock data modes:

- When `NEXT_PUBLIC_API_ENABLED=true`, the services use the real API endpoints
- When `NEXT_PUBLIC_API_ENABLED=false`, the services use mock data from `mockData.ts`

This allows development and testing without a running backend.

## API Endpoints

### Authentication

- `POST /auth/login`: Authenticate a user
- `GET /auth/verify`: Verify authentication token

### Cameras

- `GET /cameras`: List all cameras
- `GET /cameras/{id}`: Get a specific camera
- `POST /cameras`: Create a new camera
- `PUT /cameras/{id}`: Update a camera
- `DELETE /cameras/{id}`: Delete a camera
- `PATCH /cameras/bulk-update`: Update multiple cameras

## Data Format Handling

The API uses snake_case for field names, while the frontend uses camelCase. Conversion is handled automatically:

- **Frontend to API**: `ipAddress` -> `ip_address`
- **API to Frontend**: `last_seen` -> `lastSeen`

This is managed through utility functions in `utils.ts`:

- `convertToSnakeCase()`: Converts outgoing request data
- `convertToCamelCase()`: Converts incoming response data

## Error Handling

API errors are handled consistently:

1. Network errors and timeouts are caught and formatted
2. 401 Unauthorized errors trigger automatic logout
3. All errors include a readable error message in the response

## Testing API Integration

Enable API mode in `.env.local`:

```
NEXT_PUBLIC_API_ENABLED=true
```

To switch back to mock data, set:

```
NEXT_PUBLIC_API_ENABLED=false
``` 