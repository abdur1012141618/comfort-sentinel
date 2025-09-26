import { useState, useEffect } from 'react';
import { queryView, rpc } from '@/lib/supaFetch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseErr } from '@/lib/auth-utils';

export interface Alert {
  id: string;
  created_at: string;
  resident_id: string | null;
  type: string;
  severity: string | null;
  is_open: boolean;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [openAlertsCount, setOpenAlertsCount] = useState(0);
  const [todayAlertsCount, setTodayAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Fetch recent alerts using authorized view
      const alertsData = await queryView<Alert>('v_alerts', 'id, created_at, resident_id, type, severity, is_open', {
        orderBy: { column: 'created_at', ascending: false },
        limit: 20
      });

      // Fetch open alerts count
      const openAlertsData = await queryView('v_alerts', 'id', {
        filters: [{ column: 'is_open', operator: 'eq', value: true }],
        limit: 1000
      });

      // Fetch today's alerts count 
      const today = new Date().toISOString().split('T')[0];
      const todayAlertsData = await queryView('v_alerts', 'id', {
        filters: [
          { column: 'created_at', operator: 'gte', value: `${today}T00:00:00.000Z` },
          { column: 'created_at', operator: 'lt', value: `${today}T23:59:59.999Z` }
        ],
        limit: 1000
      });

      setAlerts(alertsData);
      setOpenAlertsCount(openAlertsData.length);
      setTodayAlertsCount(todayAlertsData.length);
    } catch (error: any) {
      const errorMsg = parseErr(error);
      console.error('useAlerts: Failed to fetch alerts:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await rpc('ack_alert', { p_alert_id: alertId });

      toast({
        title: "Success",
        description: "Alert acknowledged successfully",
      });

      // Refresh data
      await fetchAlerts();
    } catch (error: any) {
      const errorMsg = parseErr(error);
      console.error('useAlerts: Failed to acknowledge alert:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await rpc('resolve_alert', { p_alert_id: alertId });

      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });

      // Refresh data
      await fetchAlerts();
    } catch (error: any) {
      const errorMsg = parseErr(error);
      console.error('useAlerts: Failed to resolve alert:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    openAlertsCount,
    todayAlertsCount,
    loading,
    acknowledgeAlert,
    resolveAlert,
    refetch: fetchAlerts,
  };
};