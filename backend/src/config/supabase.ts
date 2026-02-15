import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function isPlaceholder(value?: string): boolean {
  if (!value) return true;
  const normalized = value.trim().toUpperCase();
  return (
    normalized.includes('YOUR_PROJECT_REF') ||
    normalized.includes('YOUR-SUPABASE') ||
    normalized.includes('YOUR_SUPABASE') ||
    normalized.includes('YOUR-SERVICE-ROLE') ||
    normalized.includes('YOUR_SERVICE_ROLE') ||
    normalized.includes('YOUR-SERVICE-KEY') ||
    normalized.includes('YOUR_SERVICE_KEY')
  );
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[supabase] Missing SUPABASE_URL or service key. Running without Supabase-backed routes.'
  );
}

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseServiceKey)) {
  console.warn(
    '[supabase] Placeholder Supabase values detected. Running without Supabase-backed routes.'
  );
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseServiceKey &&
    !isPlaceholder(supabaseUrl) &&
    !isPlaceholder(supabaseServiceKey)
);

// Use service key for backend (bypasses RLS, has full access) when configured.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;

export default supabase;
