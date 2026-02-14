import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController';

const router = Router();

// Public routes (no auth required)
router.get('/', asyncHandler(getItems));
router.get('/:id', asyncHandler(getItemById));

// Protected routes (auth required)
router.post('/', authenticate, asyncHandler(createItem));
router.put('/:id', authenticate, asyncHandler(updateItem));
router.delete('/:id', authenticate, asyncHandler(deleteItem));

export default router;
