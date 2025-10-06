import { supabase } from '@/integrations/supabase/client';
import { parseErr } from './auth-utils';

/**
 * Retry helper - attempts a function up to N times
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        // Exponential backoff: 300ms, 600ms, 1200ms...
        await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Fetch from a view with timeout and retry
 */
export async function fetchView<T = any>(
  viewName: string,
  select: string = '*',
  options: {
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    filters?: Array<{ column: string; operator: string; value: any }>;
  } = {}
): Promise<T[]> {
  const { orderBy, limit = 200, filters = [] } = options;
  const timeoutMs = 7000;

  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let query = (supabase as any).from(viewName).select(select).abortSignal(controller.signal);

      // Apply filters
      filters.forEach(({ column, operator, value }) => {
        switch (operator) {
          case 'eq': query = query.eq(column, value); break;
          case 'neq': query = query.neq(column, value); break;
          case 'gt': query = query.gt(column, value); break;
          case 'gte': query = query.gte(column, value); break;
          case 'lt': query = query.lt(column, value); break;
          case 'lte': query = query.lte(column, value); break;
          case 'like': query = query.like(column, value); break;
          case 'in': query = query.in(column, value); break;
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

      const { data, error } = await query;

      if (error) {
        console.error(`fetchView ${viewName} error:`, error);
        throw error;
      }

      if (import.meta.env.DEV) {
        console.log(`fetchView ${viewName}: ${data?.length || 0} records`);
      }

      return data || [];
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${viewName} timed out after ${timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  });
}
