import { fetchView } from "@/lib/api";
import { withRetry } from "@/lib/withRetry";
import { supabase } from "@/lib/api";

export async function getAlerts() {
  return withRetry(() => 
    fetchView("v_alerts", { 
      order: { column: "created_at", ascending: false }, 
      limit: 200 
    })
  );
}

export async function ackAlert(alertId: string): Promise<void> {
  const { error } = await supabase.rpc('ack_alert', { p_alert_id: alertId });
  if (error) throw error;
}

export async function resolveAlert(alertId: string): Promise<void> {
  const { error } = await supabase.rpc('resolve_alert', { p_alert_id: alertId });
  if (error) throw error;
}
