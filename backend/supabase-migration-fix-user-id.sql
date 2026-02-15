-- Fix: user_check_ins.user_id "invalid input syntax for type uuid" error
-- Run this in Supabase Dashboard: SQL Editor (your project -> SQL Editor)
--
-- The app uses email as user_id. If the column is UUID, PostgreSQL rejects it.
-- This changes user_id to TEXT. Run each block separately if you get errors.

-- 1. If you get "cannot alter type of column used by a view or rule", or FK errors,
--    first run this to find and drop the constraint (replace X with actual name):
--    SELECT conname FROM pg_constraint WHERE conrelid = 'user_check_ins'::regclass;
--    ALTER TABLE user_check_ins DROP CONSTRAINT IF EXISTS user_check_ins_user_id_fkey;

-- 2. Change user_id from UUID to TEXT
ALTER TABLE user_check_ins 
  ALTER COLUMN user_id TYPE TEXT USING user_id::text;
