/**
 * Supabase Client - Server-side (Server Components, API Routes, Server Actions)
 *
 * This client uses the service role key for admin operations
 * and the anon key for user-scoped operations with RLS.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export const hasServiceRoleKey = !!supabaseServiceRoleKey;

// Create server client with anon key (respects RLS)
export const createServerAnonClient = async () => {
  if (!isSupabaseConfigured) {
    console.warn('[Supabase Server] Demo mode: Supabase not configured');
    return createMockServerClient();
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Ignore cookie errors in Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Ignore cookie errors in Server Components
        }
      },
    },
  });
};

// Create server client with service role key (bypasses RLS - admin only)
export const createServerAdminClient = async () => {
  if (!hasServiceRoleKey) {
    console.warn('[Supabase Server] Service role key not configured. Admin operations unavailable.');
    return createMockServerClient();
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Ignore cookie errors in Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Ignore cookie errors in Server Components
        }
      },
    },
  });
};

// Mock client for demo mode
function createMockServerClient() {
  const mockFrom = (table: string) => ({
    select: () => mockFrom(table),
    insert: () => mockFrom(table),
    update: () => mockFrom(table),
    delete: () => mockFrom(table),
    eq: () => mockFrom(table),
    neq: () => mockFrom(table),
    gt: () => mockFrom(table),
    gte: () => mockFrom(table),
    lt: () => mockFrom(table),
    lte: () => mockFrom(table),
    like: () => mockFrom(table),
    ilike: () => mockFrom(table),
    in: () => mockFrom(table),
    order: () => mockFrom(table),
    limit: () => mockFrom(table),
    range: () => mockFrom(table),
    single: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
    maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
    then: (resolve: (value: { data: null; error: { message: string } }) => void) =>
      resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
  });

  return {
    from: mockFrom,
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Demo mode: Supabase not configured' } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Demo mode: Supabase not configured' } }),
      admin: {
        createUser: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
        deleteUser: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
      },
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
        download: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
        remove: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
  } as any;
}

// Get user from server-side session
export const getServerUser = async () => {
  const supabase = await createServerAnonClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

// Get user profile from server
export const getServerProfile = async (userId: string) => {
  const supabase = await createServerAnonClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};