import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase, supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

// Get all users (admin only, example)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    data,
  });
};

// Get current user profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not found', 404);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    data,
  });
};

// Update user profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const updates = req.body;

  if (!userId) {
    throw new AppError('User not found', 404);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    data,
  });
};

// Delete user account
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not found', 404);
  }

  // Delete from auth (requires service role key)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    throw new AppError(authError.message, 400);
  }

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
};
