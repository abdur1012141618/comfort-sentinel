// src/pages/Staffing.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client.ts'; // <-- এখানে `supabaseClient.ts` এর বদলে `client.ts` করা হয়েছে
import { StaffingTable } from '@/components/StaffingTable';
// ... (বাকি ইমপোর্ট লাইনগুলো অপরিবর্তিত থাকবে)
import { StaffingNetworkRequestInvalidResponseByServer } from '@/components/StaffingNetworkRequestInvalidResponseByServer';


const Staffing: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [staffingData, setStaffingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffingData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('staffing').select('*');
      if (error) throw error;
      setStaffingData(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffingData();
  }, [fetchStaffingData]);

  const isStaffing = location.pathname.includes('/staffing');

  return (
    <div className="p-4">
      {/* ... (বাকি JSX অপরিবর্তিত থাকবে) */}
      <StaffingHeader />
      {loading && <StaffingLoading />}
      {error && <StaffingError message={error} />}
      {!loading && !error && staffingData.length === 0 && <StaffingEmpty />}
      {!loading && !error && staffingData.length > 0 && (
        <StaffingTable data={staffingData} />
      )}
    </div>
  );
};

export { Staffing };
