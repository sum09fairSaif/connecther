// API Configuration - In dev, use /api so Vite proxy forwards to backend (avoids CORS)
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

// API Endpoints
export const API_ENDPOINTS = {
  // Workouts
  WORKOUTS: '/workouts',
  WORKOUT_BY_ID: (id: string) => `/workouts/${id}`,
  WORKOUTS_FILTER: '/workouts/filter',

  // Check-In
  CHECK_IN: '/check-in',
  CHECK_IN_HISTORY: (userId: string) => `/check-in/history/${userId}`,

  // Favorites
  FAVORITES: (userId: string) => `/favorites/${userId}`,
  ADD_FAVORITE: '/favorites',
  REMOVE_FAVORITE: (id: string) => `/favorites/${id}`,

  // Profile
  PROFILE: (userId: string) => `/profile/${userId}`,
  CREATE_PROFILE: '/profile',
  UPDATE_PROFILE: (userId: string) => `/profile/${userId}`,
} as const;
