import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import itemRoutes from './itemRoutes';
import workoutRoutes from './workouts.js';  // Add .js extension
import checkInRoutes from './checkIn.js';
import favoritesRoutes from './favorites.js';
import profileRoutes from './profile.js';
import doctorsRoutes from './doctors.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/items', itemRoutes);
router.use('/workouts', workoutRoutes);
router.use('/check-in', checkInRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/profile', profileRoutes);
router.use('/doctors', doctorsRoutes);

export default router;
