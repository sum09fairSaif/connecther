import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  requestPasswordReset,
  updatePassword,
} from '../controllers/authController';

const router = Router();

// Public auth routes
router.post('/signup', asyncHandler(signUp));
router.post('/signin', asyncHandler(signIn));
router.post('/signout', asyncHandler(signOut));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/password-reset', asyncHandler(requestPasswordReset));
router.put('/password', asyncHandler(updatePassword));

export default router;
