import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import itemRoutes from './itemRoutes';

const router = Router();

// Health check endpoint
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

export default router;
