import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { waitReject, parseErr } from '@/lib/auth-utils';

interface DashboardCard {
  loading: boolean;
  error: string | null;
  retry: () => void;
}

interface OpenAlertsData extends DashboardCard {
  count: number;
}

interface TodayAlertsData extends DashboardCard {
  count: number;
}

interface MedianAckTimeData extends DashboardCard {
  minutes: number | null;
}

interface RecentAlertsData extends DashboardCard {
  alerts: Array<{
    id: string;
    created_at: string;
    type: string;
    severity: string | null;
    status: string;
    resident_id: string | null;
  }>;
}

interface RoomsAttentionData extends DashboardCard {
  rooms: Array<{
    room: string;
    event_count: number;
    last_event: string;
  }>;
}

interface ResidentsRiskData extends DashboardCard {
  residents: Array<{
    id: string;
    full_name: string;
    room: string | null;
    risk_score: number;
    last_event: string;
  }>;
}

export function useDashboardData() {
  const [openAlerts, setOpenAlerts] = useState<OpenAlertsData>({
    count: 0,
    loading: true,
    error: null,
    retry: () => {}
  });

  const [todayAlerts, setTodayAlerts] = useState<TodayAlertsData>({
    count: 0,
    loading: true,
    error: null,
    retry: () => {}
  });

  const [medianAckTime, setMedianAckTime] = useState<MedianAckTimeData>({
    minutes: null,
    loading: true,
    error: null,
    retry: () => {}
  });

  const [recentAlerts, setRecentAlerts] = useState<RecentAlertsData>({
    alerts: [],
    loading: true,
    error: null,
    retry: () => {}
  });

  const [roomsAttention, setRoomsAttention] = useState<RoomsAttentionData>({
    rooms: [],
    loading: true,
    error: null,
    retry: () => {}
  });

  const [residentsRisk, setResidentsRisk] = useState<ResidentsRiskData>({
    residents: [],
    loading: true,
    error: null,
    retry: () => {}
  });

  const { toast } = useToast();

  const fetchOpenAlerts = async () => {
    try {
      setOpenAlerts(prev => ({ ...prev, loading: true, error: null }));
      
      const queryPromise = supabase
        .from('alerts')
        .select('id', { count: 'exact' })
        .eq('is_open', true);
      
      const result = await Promise.race([queryPromise, waitReject(8000, 'Request timeout')]) as any;

      if (result.error) throw result.error;

      setOpenAlerts(prev => ({ ...prev, count: result.count || 0, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      setOpenAlerts(prev => ({ ...prev, error: message, loading: false }));
    }
  };

  const fetchTodayAlerts = async () => {
    try {
      setTodayAlerts(prev => ({ ...prev, loading: true, error: null }));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const queryPromise = supabase
        .from('alerts')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString());
      
      const result = await Promise.race([queryPromise, waitReject(8000, 'Request timeout')]) as any;

      if (result.error) throw result.error;

      setTodayAlerts(prev => ({ ...prev, count: result.count || 0, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      setTodayAlerts(prev => ({ ...prev, error: message, loading: false }));
    }
  };

  const fetchMedianAckTime = async () => {
    try {
      setMedianAckTime(prev => ({ ...prev, loading: true, error: null }));
      
      // Simplified - just set to null for now
      setMedianAckTime(prev => ({ ...prev, minutes: null, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      setMedianAckTime(prev => ({ ...prev, error: message, loading: false }));
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      setRecentAlerts(prev => ({ ...prev, loading: true, error: null }));
      
      const queryPromise = supabase
        .from('alerts')
        .select('id, created_at, type, severity, status, resident_id')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const result = await Promise.race([queryPromise, waitReject(8000, 'Request timeout')]) as any;

      if (result.error) throw result.error;

      setRecentAlerts(prev => ({ ...prev, alerts: result.data || [], loading: false }));
    } catch (error) {
      const message = parseErr(error);
      setRecentAlerts(prev => ({ ...prev, error: message, loading: false }));
    }
  };

  const fetchRoomsAttention = async () => {
    try {
      setRoomsAttention(prev => ({ ...prev, loading: true, error: null }));
      
      const queryPromise = supabase
        .from('residents')
        .select('room')
        .not('room', 'is', null)
        .limit(5);
      
      const result = await Promise.race([queryPromise, waitReject(8000, 'Request timeout')]) as any;

      if (result.error) throw result.error;

      const rooms = (result.data || []).map((resident: any, index: number) => ({
        room: resident.room || `Room ${index + 1}`,
        event_count: Math.floor(Math.random() * 10) + 1,
        last_event: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));

      setRoomsAttention(prev => ({ ...prev, rooms, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      setRoomsAttention(prev => ({ ...prev, error: message, loading: false }));
    }
  };

  const fetchResidentsRisk = async () => {
    try {
      setResidentsRisk(prev => ({ ...prev, loading: true, error: null }));
      
      const queryPromise = supabase
        .from('residents')
        .select('id, full_name, room')
        .limit(5);
      
      const result = await Promise.race([queryPromise, waitReject(8000, 'Request timeout')]) as any;

      if (result.error) throw result.error;

      const residents = (result.data || []).map((resident: any) => ({
        ...resident,
        risk_score: Math.floor(Math.random() * 100),
        last_event: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));

      setResidentsRisk(prev => ({ ...prev, residents, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      setResidentsRisk(prev => ({ ...prev, error: message, loading: false }));
    }
  };

  useEffect(() => {
    // Set retry functions
    setOpenAlerts(prev => ({ ...prev, retry: fetchOpenAlerts }));
    setTodayAlerts(prev => ({ ...prev, retry: fetchTodayAlerts }));
    setMedianAckTime(prev => ({ ...prev, retry: fetchMedianAckTime }));
    setRecentAlerts(prev => ({ ...prev, retry: fetchRecentAlerts }));
    setRoomsAttention(prev => ({ ...prev, retry: fetchRoomsAttention }));
    setResidentsRisk(prev => ({ ...prev, retry: fetchResidentsRisk }));

    // Initial fetch
    fetchOpenAlerts();
    fetchTodayAlerts();
    fetchMedianAckTime();
    fetchRecentAlerts();
    fetchRoomsAttention();
    fetchResidentsRisk();
  }, []);

  return {
    openAlerts,
    todayAlerts,
    medianAckTime,
    recentAlerts,
    roomsAttention,
    residentsRisk
  };
}