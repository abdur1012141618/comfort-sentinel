import { supabase } from "@/integrations/supabase/client";

// Utility functions
export const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
export const waitReject = (ms: number, msg = 'Timeout') => 
  new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));
export const parseErr = (e: any) => e?.message ?? 'Unexpected error';

// Profile bootstrap function
export async function ensureProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (import.meta.env.DEV) {
    console.log('ensureProfile: Creating/updating profile for user:', user.id);
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: false })
    .select('id')
    .single();
    
  if (error) {
    if (import.meta.env.DEV) {
      console.error('ensureProfile: Failed to upsert profile:', error);
    }
    throw error;
  }

  if (import.meta.env.DEV) {
    console.log('ensureProfile: Profile ensured successfully');
  }
}