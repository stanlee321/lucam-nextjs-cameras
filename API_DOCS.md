# LucaM Camera Management API Documentation

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. All API requests (except login) must include an `Authorization` header with a valid JWT token.

### Authentication Headers

```
Authorization: Bearer <jwt_token>
```

## API Base URL

```
https://api.lucam-system.com/v1
```

## Authentication Endpoints

### Login

Authenticates a user and returns a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No

#### Request Body

```json
{
  "username": "admin",
  "password": "yourpassword"
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Admin User",
      "role": "SuperAdmin",
      "email": "admin@example.com"
    },
    "expiresIn": 86400
  }
}
```

#### Error Response

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

### Verify Token

Verifies if a token is valid.

- **URL**: `/auth/verify`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Admin User",
      "role": "SuperAdmin",
      "email": "admin@example.com"
    }
  }
}
```

#### Error Response

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

## Camera Endpoints

### Get All Cameras

Returns a paginated list of cameras.

- **URL**: `/cameras`
- **Method**: `GET`
- **Auth Required**: Yes

#### Query Parameters

| Parameter | Type    | Required | Description                                |
|-----------|---------|----------|--------------------------------------------|
| page      | integer | No       | Page number (default: 1)                   |
| limit     | integer | No       | Items per page (default: 10, max: 100)     |
| search    | string  | No       | Search term for name or location           |
| active    | boolean | No       | Filter by active status                    |

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 101,
        "name": "Front Gate",
        "location": "Entrance",
        "active": true,
        "ipAddress": "192.168.1.101",
        "port": 554,
        "lastSeen": "2023-03-09T15:30:45Z"
      },
      {
        "id": 103,
        "name": "Lobby",
        "location": "Office",
        "active": true,
        "ipAddress": "192.168.1.103",
        "port": 8554,
        "lastSeen": "2023-03-09T16:45:10Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### Error Response

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Get Camera by ID

Returns details for a specific camera.

- **URL**: `/cameras/:id`
- **Method**: `GET`
- **Auth Required**: Yes

#### URL Parameters

| Parameter | Type    | Required | Description           |
|-----------|---------|----------|-----------------------|
| id        | integer | Yes      | ID of the camera      |

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Front Gate",
    "location": "Entrance",
    "active": true,
    "ipAddress": "192.168.1.101",
    "port": 554,
    "lastSeen": "2023-03-09T15:30:45Z"
  }
}
```

#### Error Response

- **Code**: 404 Not Found
- **Content**:

```json
{
  "success": false,
  "error": "Camera not found"
}
```

### Create Camera

Creates a new camera.

- **URL**: `/cameras`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permission**: Admin or SuperAdmin

#### Request Body

```json
{
  "name": "Rear Entrance",
  "location": "Back Gate",
  "active": true,
  "ipAddress": "192.168.1.106",
  "port": 554
}
```

#### Success Response

- **Code**: 201 Created
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 106,
    "name": "Rear Entrance",
    "location": "Back Gate",
    "active": true,
    "ipAddress": "192.168.1.106",
    "port": 554,
    "lastSeen": null
  }
}
```

#### Error Response

- **Code**: 400 Bad Request
- **Content**:

```json
{
  "success": false,
  "error": "Name and location are required fields"
}
```

OR

- **Code**: 403 Forbidden
- **Content**:

```json
{
  "success": false,
  "error": "Insufficient permissions to create cameras"
}
```

### Update Camera

Updates an existing camera.

- **URL**: `/cameras/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permission**: Admin or SuperAdmin

#### URL Parameters

| Parameter | Type    | Required | Description           |
|-----------|---------|----------|-----------------------|
| id        | integer | Yes      | ID of the camera      |

#### Request Body

```json
{
  "name": "Updated Front Gate",
  "location": "Main Entrance",
  "active": false,
  "ipAddress": "192.168.1.101",
  "port": 8554
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Updated Front Gate",
    "location": "Main Entrance",
    "active": false,
    "ipAddress": "192.168.1.101",
    "port": 8554,
    "lastSeen": "2023-03-09T15:30:45Z"
  }
}
```

#### Error Response

- **Code**: 404 Not Found
- **Content**:

```json
{
  "success": false,
  "error": "Camera not found"
}
```

### Delete Camera

Deletes a camera.

- **URL**: `/cameras/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permission**: Admin or SuperAdmin

#### URL Parameters

| Parameter | Type    | Required | Description           |
|-----------|---------|----------|-----------------------|
| id        | integer | Yes      | ID of the camera      |

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "message": "Camera deleted successfully",
    "id": 101
  }
}
```

#### Error Response

- **Code**: 404 Not Found
- **Content**:

```json
{
  "success": false,
  "error": "Camera not found"
}
```

### Bulk Update Cameras

Updates multiple cameras simultaneously.

- **URL**: `/cameras/bulk-update`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Permission**: Admin or SuperAdmin

#### Request Body

```json
{
  "ids": [101, 103, 105],
  "updates": {
    "active": true
  }
}
```

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "cameras": [101, 103, 105]
  }
}
```

#### Error Response

- **Code**: 400 Bad Request
- **Content**:

```json
{
  "success": false,
  "error": "Camera IDs and update data are required"
}
```

## Error Codes and Meanings

| Status Code | Description                                          |
|-------------|------------------------------------------------------|
| 200         | OK - The request has succeeded                       |
| 201         | Created - New resource has been created              |
| 400         | Bad Request - Invalid request format                 |
| 401         | Unauthorized - Authentication is required            |
| 403         | Forbidden - No permission to access the resource     |
| 404         | Not Found - The requested resource does not exist    |
| 500         | Internal Server Error - Server encountered an error  |

## Pagination

Endpoints that return collections support pagination using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

The response will include pagination metadata:

```json
{
  "data": [...],
  "total": 42,  // Total number of items
  "page": 2,    // Current page
  "limit": 10   // Items per page
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 60 requests per minute for authenticated users
- 10 requests per minute for unauthenticated requests

Rate limit headers are included in the response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1678359245
```

## API Versioning

The API is versioned through the URL path (e.g., `/v1/cameras`). The current version is `v1`. 