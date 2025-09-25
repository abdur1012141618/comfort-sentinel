import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
    try {
      // Fetch recent alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('id, created_at, resident_id, type, severity, is_open')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;

      // Fetch open alerts count
      const { count: openCount, error: openError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_open', true);

      if (openError) throw openError;

      // Fetch today's alerts count 
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (todayError) throw todayError;

      setAlerts(alertsData || []);
      setOpenAlertsCount(openCount || 0);
      setTodayAlertsCount(todayCount || 0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_open: false })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert acknowledged successfully",
      });

      // Refresh data
      await fetchAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_open: false })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });

      // Refresh data
      await fetchAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve alert",
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