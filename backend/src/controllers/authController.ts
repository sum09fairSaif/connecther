import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

// Sign up
export const signUp = async (req: Request, res: Response) => {
  const { email, password, ...metadata } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // Additional user metadata
    },
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.status(201).json({
    success: true,
    message: 'User created successfully. Please check your email for verification.',
    data: {
      user: data.user,
      session: data.session,
    },
  });
};

// Sign in
export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AppError(error.message, 401);
  }

  res.json({
    success: true,
    data: {
      user: data.user,
      session: data.session,
    },
  });
};

// Sign out
export const signOut = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    message: 'Signed out successfully',
  });
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError('Refresh token is required', 400);
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token,
  });

  if (error) {
    throw new AppError(error.message, 401);
  }

  res.json({
    success: true,
    data: {
      session: data.session,
    },
  });
};

// Reset password request
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    message: 'Password reset email sent',
  });
};

// Update password
export const updatePassword = async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError('New password is required', 400);
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    message: 'Password updated successfully',
  });
};
