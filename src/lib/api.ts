import { supabase } from "@/lib/supabaseClient"; // আপনার প্রোজেক্টে যেটা আছে
import { withRetry } from "./withRetry";

export async function getResidents() {
  return withRetry(async (signal) => {
    const { data, error } = await supabase
      .from("v_residents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .abortSignal(signal);
    if (error) throw error;
    return data!;
  });
}

export async function getAlerts() {
  return withRetry(async (signal) => {
    const { data, error } = await supabase
      .from("v_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .abortSignal(signal);
    if (error) throw error;
    return data!;
  });
}

/** আপনি যেটা SQL-এ বানিয়েছেন: public.alerts_resolve(p_alert_id uuid)  */
export async function resolveAlert(alertId: string) {
  return withRetry(async (signal) => {
    const { data, error } = await supabase.rpc("alerts_resolve", { p_alert_id: alertId }).abortSignal(signal);
    if (error) throw error;
    // এই RPC void রিটার্ন করে, তাই data === null হওয়াই স্বাভাবিক → success ধরুন
    return data;
  });
}
