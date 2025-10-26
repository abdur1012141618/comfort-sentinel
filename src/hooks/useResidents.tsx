import { useState, useEffect } from 'react';
import { getResidents } from '@/api/residents';
import { parseErr } from '@/lib/auth-utils';

interface Resident {
  id: string;
  name: string;
  room: string;
  age: number;
  gait: string;
  notes?: string;
  created_at: string;
}

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await getResidents();
      setResidents(data as Resident[]);
      setError(null);
    } catch (err) {
      const errorMsg = parseErr(err);
      setError(new Error(errorMsg));
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  return { residents, loading, error, refetch: fetchResidents };
}
