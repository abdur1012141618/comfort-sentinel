import { useState, useEffect } from 'react';
import { fetchView } from '@/lib/api';
import { parseErr } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

type TableName = 'residents' | 'fall_checks' | 'alerts' | 'profiles';

interface UseDataLoaderOptions {
  table: TableName;
  select?: string;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
}

// Map table names to their corresponding authorized views
const getViewName = (table: TableName): string => {
  switch (table) {
    case 'residents':
      return 'v_residents';
    case 'alerts':
      return 'v_alerts'; 
    case 'fall_checks':
      return 'v_fall_checks';
    case 'profiles':
      return 'profiles'; // profiles don't need a view
    default:
      return table;
  }
};

export function useDataLoader<T>({ table, select = '*', limit, orderBy }: UseDataLoaderOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const viewName = getViewName(table);
      
      if (import.meta.env.DEV) {
        console.log(`useDataLoader: Fetching data from ${viewName}...`);
      }

      const result = await fetchView(viewName, select, {
        limit: limit ?? 50,
        orderBy: orderBy ?? { column: 'created_at', ascending: false }
      });

      setData(result ?? []);

      if (import.meta.env.DEV) {
        console.log(`useDataLoader: Successfully loaded ${result?.length || 0} records from ${viewName}`);
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