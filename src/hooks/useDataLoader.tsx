import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { waitReject, parseErr } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

type TableName = 'residents' | 'fall_checks' | 'alerts' | 'profiles';

interface UseDataLoaderOptions {
  table: TableName;
  select?: string;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
}

export function useDataLoader<T>({ table, select = '*', limit, orderBy }: UseDataLoaderOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (import.meta.env.DEV) {
        console.log(`useDataLoader: Fetching data from ${table}...`);
      }

      let query = supabase.from(table).select(select);
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      const dataPromise = query;
      const timeoutPromise = waitReject(8000, 'Request timeout');

      const { data: result, error: fetchError } = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any;

      if (fetchError) throw fetchError;

      setData(result ?? []);

      if (import.meta.env.DEV) {
        console.log(`useDataLoader: Successfully loaded ${result?.length || 0} records from ${table}`);
      }
    } catch (err) {
      const errorMsg = parseErr(err);
      console.error(`useDataLoader: Failed to load data from ${table}:`, err);
      setError(errorMsg);
      toast({
        title: "Loading Error",
        description: errorMsg,
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, select, limit]);

  const retry = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    retry,
    refetch: fetchData
  };
}