# Express + TypeScript + Supabase Backend

A robust REST API backend built with Express.js, TypeScript, and Supabase.

## 🚀 Features

- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database with built-in auth
- **JWT Authentication** - Secure user authentication
- **CRUD Operations** - Complete example endpoints
- **Error Handling** - Centralized error management
- **Rate Limiting** - API protection
- **CORS** - Configured for frontend integration
- **Security** - Helmet.js security headers

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── userController.ts    # User management
│   │   └── itemController.ts    # CRUD operations example
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── errorHandler.ts      # Error handling utilities
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth endpoints
│   │   ├── userRoutes.ts        # User endpoints
│   │   ├── itemRoutes.ts        # Item CRUD endpoints
│   │   └── index.ts             # Route aggregator
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── index.ts                 # Main application entry
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

1. **Clone or navigate to the backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=3000
NODE_ENV=development

# Get these from your Supabase project settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

## 🗄️ Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get your credentials** from Project Settings > API

3. **Create tables** (example schema):

```sql
-- Users table (handled by Supabase Auth)

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table (example)
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Anyone can view items"
  ON items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

## 🚀 Running the Server

**Development mode (with hot reload):**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Run production build:**

```bash
npm start
```

Server will run on `http://localhost:3000`

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

### Authentication

```
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
POST /api/auth/refresh
POST /api/auth/password-reset
PUT  /api/auth/password
```

### Users

```
GET    /api/users/profile         # Get current user profile
PUT    /api/users/profile         # Update profile
DELETE /api/users/account         # Delete account
GET    /api/users                 # Get all users (admin only)
```

### Items (Example CRUD)

```
GET    /api/items                 # Get all items (public)
GET    /api/items/:id             # Get item by ID (public)
POST   /api/items                 # Create item (auth required)
PUT    /api/items/:id             # Update item (auth required)
DELETE /api/items/:id             # Delete item (auth required)
```

## 🔐 Authentication Flow

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

### Sign In

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Response includes access_token
{
  "success": true,
  "data": {
    "user": { ... },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "...",
      "expires_at": 1234567890
    }
  }
}
```

### Protected Requests

Include the token in the Authorization header:

```bash
GET /api/users/profile
Authorization: Bearer eyJhbGc...
```

## 🔌 Frontend Integration

### Example using Axios:

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sign in
const signIn = async (email: string, password: string) => {
  const response = await api.post('/auth/signin', { email, password });
  localStorage.setItem('access_token', response.data.data.session.access_token);
  return response.data;
};

// Get items
const getItems = async () => {
  const response = await api.get('/items');
  return response.data;
};

// Create item (requires auth)
const createItem = async (itemData: any) => {
  const response = await api.post('/items', itemData);
  return response.data;
};
```

### Example using Fetch:

```typescript
const token = localStorage.getItem('access_token');

fetch('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🧪 Testing the API

You can test the API using tools like:
- **Postman** - Import endpoints and test
- **Thunder Client** (VS Code extension)
- **curl** - Command line testing

Example curl request:

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get items
curl http://localhost:3000/api/items

# Create item (with auth)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Item","description":"This is a test"}'
```

## 🛡️ Security Features

- **Helmet.js** - Sets security headers
- **CORS** - Configured for your frontend
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **JWT Authentication** - Secure token-based auth
- **Row Level Security** - Database-level security with Supabase
- **Environment Variables** - Sensitive data kept in .env

## 📝 Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Run production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## 🚨 Error Handling

The API uses a centralized error handling system:

```typescript
// In your controllers, throw AppError for known errors
throw new AppError('Item not found', 404);

// Or use asyncHandler to catch all errors
export const getItems = asyncHandler(async (req, res) => {
  // Your code here - errors are automatically caught
});
```

Error responses follow this format:

```json
{
  "error": "Error message",
  "status": 404
}
```

## 🔄 Next Steps

1. Customize the `items` table schema for your use case
2. Add more controllers and routes as needed
3. Set up your frontend to consume these APIs
4. Configure Supabase RLS policies for your security needs
5. Add real-time subscriptions using Supabase Realtime
6. Implement file uploads using Supabase Storage

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Need Help?

Check the example controllers and routes for implementation patterns. Each file is well-commented to guide you through the code.

---

**Happy Coding! 🎉**
