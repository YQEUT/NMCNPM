import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.error('Supabase initialization error:', err.message);
  // Export a mock or null if it fails, so other components don't crash on import
  supabase = {
    from: () => ({
      select: () => ({ select: () => Promise.resolve({ data: [], error: null }), single: () => Promise.resolve({ data: null, error: null }) }),
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: () => Promise.resolve({ data: [], error: null })
    })
  };
}

export { supabase };
