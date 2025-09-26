import { supabase } from '@/integrations/supabase/client';
import { waitReject, parseErr } from '@/lib/auth-utils';

/**
 * Generic RPC helper with timeout and error logging
 */
export async function rpc<T = any>(
  functionName: string, 
  args?: Record<string, any>,
  timeoutMs: number = 8000
): Promise<T> {
  try {
    if (import.meta.env.DEV) {
      console.log(`supaFetch: Calling RPC ${functionName} with args:`, args);
    }

    // Use the supabase client with type assertion to handle dynamic function names
    const rpcPromise = (supabase as any).rpc(functionName, args);
    const timeoutPromise = waitReject(timeoutMs, `RPC ${functionName} timeout after ${timeoutMs}ms`);

    const { data, error } = await Promise.race([
      rpcPromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error(`supaFetch: RPC ${functionName} failed:`, error);
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log(`supaFetch: RPC ${functionName} succeeded`);
    }

    return data;
  } catch (err) {
    const errorMsg = parseErr(err);
    console.error(`supaFetch: RPC ${functionName} exception:`, err);
    throw new Error(errorMsg);
  }
}

/**
 * Generic query helper with timeout and error logging for authorized views
 */
export async function queryView<T = any>(
  viewName: string,
  select: string = '*',
  options: {
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    filters?: Array<{ column: string; operator: string; value: any }>;
    timeoutMs?: number;
  } = {}
): Promise<T[]> {
  const { orderBy, limit = 50, filters = [], timeoutMs = 8000 } = options;

  try {
    if (import.meta.env.DEV) {
      console.log(`supaFetch: Querying view ${viewName} with options:`, options);
    }

    // Use type assertion to handle dynamic view names
    let query = (supabase as any).from(viewName).select(select);

    // Apply filters
    filters.forEach(({ column, operator, value }) => {
      switch (operator) {
        case 'eq':
          query = query.eq(column, value);
          break;
        case 'neq':
          query = query.neq(column, value);
          break;
        case 'gt':
          query = query.gt(column, value);
          break;
        case 'gte':
          query = query.gte(column, value);
          break;
        case 'lt':
          query = query.lt(column, value);
          break;
        case 'lte':
          query = query.lte(column, value);
          break;
        case 'like':
          query = query.like(column, value);
          break;
        case 'in':
          query = query.in(column, value);
          break;
        default:
          console.warn(`supaFetch: Unknown operator ${operator}`);
      }
    });

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const queryPromise = query;
    const timeoutPromise = waitReject(timeoutMs, `Query ${viewName} timeout after ${timeoutMs}ms`);

    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error(`supaFetch: Query ${viewName} failed:`, error);
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log(`supaFetch: Query ${viewName} returned ${data?.length || 0} records`);
    }

    return data || [];
  } catch (err) {
    const errorMsg = parseErr(err);
    console.error(`supaFetch: Query ${viewName} exception:`, err);
    throw new Error(errorMsg);
  }
}