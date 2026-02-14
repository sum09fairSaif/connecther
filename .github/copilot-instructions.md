# Copilot Instructions for Children-Symptom-Communicator

## Overview
This project is a robust REST API backend built with Express.js, TypeScript, and Supabase. It features JWT authentication, centralized error handling, and CRUD operations for user and item management.

## Architecture
- **Backend Structure**: The backend is organized into several key directories:
  - **src/**: Contains the main application code.
    - **config/**: Configuration files, including Supabase client setup.
    - **controllers/**: Business logic for handling requests (e.g., `authController.ts`, `userController.ts`, `itemController.ts`).
    - **middleware/**: Middleware functions for authentication and error handling.
    - **routes/**: Defines API endpoints and aggregates routes.
    - **types/**: TypeScript type definitions.

## Developer Workflows
- **Installation**: Clone the repository and install dependencies:
  ```bash
  cd backend
  npm install
  cp .env.example .env
  ```
- **Running the Server**: Use the following commands:
  - Development mode (with hot reload): `npm run dev`
  - Build for production: `npm run build`
  - Run production build: `npm start`

## Project Conventions
- **Environment Variables**: Store sensitive information in the `.env` file. Example:
  ```env
  SUPABASE_URL=https://your-project.supabase.co
  JWT_SECRET=your-secret-key
  ```
- **Database Policies**: Supabase Row Level Security (RLS) is enabled for user-specific data access. Ensure to define policies for CRUD operations.

## Integration Points
- **Supabase**: The project integrates with Supabase for database management and authentication. Ensure to set up your Supabase project and configure the database schema as outlined in the README.

## API Endpoints
- **Health Check**: `GET /api/health`
- **Authentication**: Endpoints for user signup, signin, and management.
- **Users**: CRUD operations for user profiles.
- **Items**: Example CRUD operations for items.

## Example Request
### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

### Protected Request
Include the token in the Authorization header:
```bash
GET /api/users/profile
Authorization: Bearer <access_token>
```

---

This document serves as a guide for AI coding agents to understand the structure, workflows, and conventions of the Children-Symptom-Communicator project. Adjustments and updates should be made as the project evolves.