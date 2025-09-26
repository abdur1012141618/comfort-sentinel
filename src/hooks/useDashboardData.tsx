import { useState, useEffect } from 'react';
import { queryView } from '@/lib/supaFetch';
import { useToast } from '@/hooks/use-toast';
import { parseErr } from '@/lib/auth-utils';

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
      
      const data = await queryView('v_alerts', 'id', {
        filters: [{ column: 'is_open', operator: 'eq', value: true }],
        limit: 1000
      });

      setOpenAlerts(prev => ({ ...prev, count: data.length, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      console.error('Dashboard: Failed to fetch open alerts:', error);
      setOpenAlerts(prev => ({ ...prev, error: message, loading: false }));
      toast({
        title: "Data Loading Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchTodayAlerts = async () => {
    try {
      setTodayAlerts(prev => ({ ...prev, loading: true, error: null }));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const data = await queryView('v_alerts', 'id', {
        filters: [{ column: 'created_at', operator: 'gte', value: today.toISOString() }],
        limit: 1000
      });

      setTodayAlerts(prev => ({ ...prev, count: data.length, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      console.error('Dashboard: Failed to fetch today alerts:', error);
      setTodayAlerts(prev => ({ ...prev, error: message, loading: false }));
      toast({
        title: "Data Loading Error",
        description: message,
        variant: "destructive",
      });
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
      
      const data = await queryView('v_alerts', 'id, created_at, type, severity, status, resident_id', {
        orderBy: { column: 'created_at', ascending: false },
        limit: 10
      });

      setRecentAlerts(prev => ({ ...prev, alerts: data, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      console.error('Dashboard: Failed to fetch recent alerts:', error);
      setRecentAlerts(prev => ({ ...prev, error: message, loading: false }));
      toast({
        title: "Data Loading Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchRoomsAttention = async () => {
    try {
      setRoomsAttention(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await queryView('v_residents', 'room', {
        filters: [{ column: 'room', operator: 'neq', value: null }],
        limit: 5
      });

      const rooms = (data || []).map((resident: any, index: number) => ({
        room: resident.room || `Room ${index + 1}`,
        event_count: Math.floor(Math.random() * 10) + 1,
        last_event: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));

      setRoomsAttention(prev => ({ ...prev, rooms, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      console.error('Dashboard: Failed to fetch rooms attention:', error);
      setRoomsAttention(prev => ({ ...prev, error: message, loading: false }));
      toast({
        title: "Data Loading Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchResidentsRisk = async () => {
    try {
      setResidentsRisk(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await queryView('v_residents', 'id, full_name, room', {
        limit: 5
      });

      const residents = (data || []).map((resident: any) => ({
        ...resident,
        risk_score: Math.floor(Math.random() * 100),
        last_event: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));

      setResidentsRisk(prev => ({ ...prev, residents, loading: false }));
    } catch (error) {
      const message = parseErr(error);
      console.error('Dashboard: Failed to fetch residents risk:', error);
      setResidentsRisk(prev => ({ ...prev, error: message, loading: false }));
      toast({
        title: "Data Loading Error",
        description: message,
        variant: "destructive",
      });
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