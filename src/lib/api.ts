// src/lib/api.ts
import { supabase } from "@/lib/supabaseClient";
import { withRetry } from "@/lib/retry";

// Residents
export async function getResidents(signal?: AbortSignal) {
  return withRetry(async (s) => {
    const { data, error } = await supabase
      .from("v_residents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .abortSignal(s);
    if (error) throw error;
    return data;
  });
}

// Alerts
export async function getAlerts(signal?: AbortSignal) {
  return withRetry(async (s) => {
    const { data, error } = await supabase
      .from("v_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .abortSignal(s);
    if (error) throw error;
    return data;
  });
}
