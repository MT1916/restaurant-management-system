import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Sign in with email and password
export const signInAnonymously = async (): Promise<void> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // First try to get existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (session) return;

      // If no session exists, try to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: 'restaurant@example.com',
        password: 'restaurant123'
      });
      
      if (error) throw error;
      return;
    } catch (error: any) {
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempt < MAX_RETRIES - 1) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await delay(retryDelay);
      }
    }
  }
  
  throw lastError;
};

// Initialize auth on app load with retry mechanism
export const initializeAuth = async () => {
  let lastError: any;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await signInAnonymously();
      return;
    } catch (error: any) {
      lastError = error;
      console.warn(`Auth attempt ${attempt + 1} failed:`, error);
      
      // Don't wait on the last attempt
      if (attempt < MAX_RETRIES - 1) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await delay(retryDelay);
      }
    }
  }
  
  console.error('Authentication failed after all retries');
  throw lastError;
};