import { supabase } from '@/integrations/supabase/client';

export async function ackAlert(alertId: string) {
  const { error } = await supabase.rpc("ack_alert" as any, { p_alert_id: alertId });
  if (error) throw error;
}

export async function resolveAlert(alertId: string) {
  const { error } = await supabase.rpc("resolve_alert" as any, { p_alert_id: alertId });
  if (error) throw error;
}