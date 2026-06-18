import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});

let cachedAccessToken = '';

// Subscribe immediately to keep cachedAccessToken in sync
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.access_token) {
    cachedAccessToken = session.access_token;
  } else {
    cachedAccessToken = '';
  }
});

// Helper to get cached token synchronously without any promise/storage lookup
export function getCachedToken(): string {
  // As a fallback, try to read the token synchronously from client instance state
  if (!cachedAccessToken) {
    const sessionStr = localStorage.getItem('sb-' + new URL(supabaseUrl).hostname + '-auth-token');
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        if (parsed?.access_token) {
          cachedAccessToken = parsed.access_token;
        }
      } catch {}
    }
  }
  return cachedAccessToken;
}
