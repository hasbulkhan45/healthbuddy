/**
 * Supabase Client - Browser/Client-side
 *
 * This client is used in React components and client-side code.
 * It uses the anon key and respects Row Level Security.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a mock client for demo mode when Supabase is not configured
const createMockClient = () => {
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
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: { message: 'Demo mode: Supabase not configured' } }),
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
};

// Export the appropriate client
export const createClient = () => {
  if (!isSupabaseConfigured) {
    if (typeof window !== 'undefined') {
      console.warn('[Supabase] Demo mode: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Using mock client.');
    }
    return createMockClient();
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
};

// Singleton instance for client-side use
let clientInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
};

// Helper to check connection status
export const checkSupabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    return { connected: false, error: 'Supabase not configured (missing environment variables)' };
  }

  try {
    const client = getSupabaseClient();
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};