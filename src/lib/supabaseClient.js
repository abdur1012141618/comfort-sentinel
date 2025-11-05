import { createClient } from '@supabase/supabase-js';

// Vercel-এর এনভায়রনমেন্ট ভেরিয়েবল ব্যবহারের জন্য পরিবর্তন করা হয়েছে
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
