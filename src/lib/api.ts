import { createClient } from "@supabase/supabase-js";

const url = "https://rtlalqcuufxewrkputzq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bGFscWN1dWZ4ZXdya3B1dHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDc4ODYsImV4cCI6MjA3MjQyMzg4Nn0.eaF49nZ8cf_vxkJhECqvMfGa6hTK5ahf5Zb4xIJm2bM";

export const supabase = createClient(url, key, {
  auth: { persistSession: true },
});

export type FetchViewOptions = {
  select?: string;
  eq?: Record<string, string | number | boolean | null | undefined>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchView<T = any>(
  view: string,
  opts: FetchViewOptions = {}
): Promise<T[]> {
  const { select = "*", eq = {}, order, limit, signal } = opts;
  let q = supabase.from(view).select(select);

  for (const [k, v] of Object.entries(eq)) {
    if (v !== undefined) q = q.eq(k, v as any);
  }
  if (order) q = q.order(order.column, { ascending: order.ascending ?? false });
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data as T[]) ?? [];
}
