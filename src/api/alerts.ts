// src/api/alerts.ts
import { rpc } from "@/lib/supaFetch";

export async function ackAlert(alertId: string): Promise<void> {
  await rpc('ack_alert', { p_alert_id: alertId });
}

export async function resolveAlert(alertId: string): Promise<void> {
  await rpc('resolve_alert', { p_alert_id: alertId });
}
