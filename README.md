# LucaM Camera Management System

A modern, responsive web application for managing IP cameras. Built with Next.js, TypeScript, and Material UI.

## Features

- **Authentication** - Secure JWT-based authentication system
- **Camera Management** - Add, edit, delete, and view IP cameras
- **User Management** - Manage users with different role permissions
- **Role-Based Access Control** - Different functionality for Admins vs. Viewers
- **Responsive UI** - Works on desktop and mobile devices

## Project Setup

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

- Admin: `admin` / `admin123`
- Viewer: `user` / `user123`

## Project Structure

```
src/
├── components/        # React components
│   ├── layout/        # Layout components
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts (Auth, etc.)
├── pages/             # Next.js pages
│   ├── api/           # API routes
│   ├── cameras/       # Camera management pages
│   ├── users/         # User management pages
│   └── _app.tsx       # App component
├── services/          # Service layer
│   └── api/           # API services
└── styles/            # Global styles
```

## Development Notes

- The application uses a hybrid approach with mock data for development but can connect to a real API in production
- To enable real API calls, set `API_ENABLED = true` in the service files
- The authentication system is currently using mock data but is designed to work with a real backend

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed API documentation including:
- Authentication endpoints
- Camera management endpoints 
- Request/response formats
- Error handling

## License

[MIT](LICENSE)
