import { supabase } from "@/integrations/supabase/client";

// Reliable CRUD operations that always return data and handle errors properly

export async function updateResident(id: string, patch: any) {
  const { data, error } = await supabase
    .from('residents')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function insertResident(payload: any) {
  const { data, error } = await supabase
    .from('residents')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteResident(id: string) {
  const { error } = await supabase.from('residents').delete().eq('id', id);
  if (error) throw error;
}

export async function updateFallCheck(id: string, patch: any) {
  const { data, error } = await supabase
    .from('fall_checks')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function insertFallCheck(payload: any) {
  const { data, error } = await supabase
    .from('fall_checks')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFallCheck(id: string) {
  const { error } = await supabase.from('fall_checks').delete().eq('id', id);
  if (error) throw error;
}

export async function updateAlert(id: string, patch: any) {
  const { data, error } = await supabase
    .from('alerts')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  // Handle specific Supabase error codes
  if (error.code) {
    switch (error.code) {
      case '23503':
      case '42501':
        return "You don't have permission to modify this item.";
      case '22P02':
        return "Invalid date format.";
      case '23505':
        return "This item already exists.";
      default:
        return error.message || 'An error occurred';
    }
  }
  
  return error.message || 'An error occurred';
}