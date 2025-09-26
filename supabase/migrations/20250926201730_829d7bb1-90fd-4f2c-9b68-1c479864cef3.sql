-- Fix search path security issues for the alert RPC functions
create or replace function public.ack_alert(p_alert_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.alerts
  set status = 'closed'
  where id = p_alert_id
    and org_id = public.current_org_id();
end;
$$;

create or replace function public.resolve_alert(p_alert_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.alerts
  set status = 'closed', resolved_at = now()
  where id = p_alert_id
    and org_id = public.current_org_id();
end;
$$;