import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', asyncHandler(getUserProfile));

// Update current user profile
router.put('/profile', asyncHandler(updateUserProfile));

// Delete current user account
router.delete('/account', asyncHandler(deleteUser));

// Admin only: Get all users
router.get('/', authorize('admin'), asyncHandler(getAllUsers));

export default router;
