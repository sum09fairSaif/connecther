import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

// Get all items
export const getItems = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;
  
  let query = supabase
    .from('items')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Add search filter if provided
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Add pagination
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / Number(limit)),
    },
  });
};

// Get single item by ID
export const getItemById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new AppError(error.message, 404);
  }

  res.json({
    success: true,
    data,
  });
};

// Create new item
export const createItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const itemData = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { data, error } = await supabase
    .from('items')
    .insert([{ ...itemData, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.status(201).json({
    success: true,
    data,
  });
};

// Update item
export const updateItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updates = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Check if item belongs to user
  const { data: existingItem, error: checkError } = await supabase
    .from('items')
    .select('user_id')
    .eq('id', id)
    .single();

  if (checkError || !existingItem) {
    throw new AppError('Item not found', 404);
  }

  if (existingItem.user_id !== userId) {
    throw new AppError('You do not have permission to update this item', 403);
  }

  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
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

// Delete item
export const deleteItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Check if item belongs to user
  const { data: existingItem, error: checkError } = await supabase
    .from('items')
    .select('user_id')
    .eq('id', id)
    .single();

  if (checkError || !existingItem) {
    throw new AppError('Item not found', 404);
  }

  if (existingItem.user_id !== userId) {
    throw new AppError('You do not have permission to delete this item', 403);
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError(error.message, 400);
  }

  res.json({
    success: true,
    message: 'Item deleted successfully',
  });
};
