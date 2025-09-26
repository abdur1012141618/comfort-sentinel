-- Add resolved_at column to alerts table
alter table public.alerts add column if not exists resolved_at timestamp with time zone;

-- Create or replace RPC functions for alert management
create or replace function public.ack_alert(p_alert_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.alerts
  set status = 'closed'
  where id = p_alert_id
    and org_id = public.current_org_id();
$$;

create or replace function public.resolve_alert(p_alert_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.alerts
  set status = 'closed', resolved_at = now()
  where id = p_alert_id
    and org_id = public.current_org_id();
$$;

-- RLS: allow update within own org
drop policy if exists alerts_update_org on public.alerts;
create policy alerts_update_org
on public.alerts
for update
to authenticated
using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

-- Grants (signature must match)
grant execute on function public.ack_alert(p_alert_id uuid) to authenticated;
grant execute on function public.resolve_alert(p_alert_id uuid) to authenticated;

-- Indexes for performance
create index if not exists idx_alerts_org_created on public.alerts(org_id, created_at desc);
create index if not exists idx_alerts_org_status on public.alerts(org_id, status);