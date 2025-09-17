// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Hilfreich beim lokalen Debuggen
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_SUPABASE_URL oder REACT_APP_SUPABASE_ANON_KEY fehlt.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
