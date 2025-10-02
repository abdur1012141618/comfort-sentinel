-- Fix v_alerts to include is_open column and grant execute on RPC functions
drop view if exists public.v_alerts cascade;
create or replace view public.v_alerts as
select id, org_id, resident_id, type, severity, status, is_open, created_at
from public.alerts
where org_id = public.current_org_id()
order by created_at desc
limit 200;

grant select on public.v_alerts to authenticated;

-- Ensure RPC functions have execute permission
grant execute on function public.ack_alert(uuid) to authenticated;
grant execute on function public.resolve_alert(uuid) to authenticated;

-- Create test data seeding function
create or replace function public.seed_test_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_residents_inserted int := 0;
  v_alerts_inserted int := 0;
  v_fall_checks_inserted int := 0;
  v_resident_ids uuid[];
  v_rid uuid;
begin
  -- Insert 5 test residents
  insert into public.residents (org_id, full_name, room, notes)
  select 
    v_org_id,
    'Test Resident ' || i::text,
    'Room ' || (100 + i)::text,
    'Auto-generated test data'
  from generate_series(1, 5) as i
  returning id into v_resident_ids;
  
  get diagnostics v_residents_inserted = row_count;
  
  -- Store resident IDs for use in alerts and fall checks
  select array_agg(id) into v_resident_ids from public.residents where org_id = v_org_id limit 5;
  
  -- Insert 20 alerts
  for v_rid in select unnest(v_resident_ids) loop
    insert into public.alerts (org_id, resident_id, type, severity, status, is_open, created_at)
    select
      v_org_id,
      v_rid,
      (array['fall', 'wandering', 'medication'])[floor(random() * 3 + 1)],
      (array['low', 'medium', 'high'])[floor(random() * 3 + 1)],
      (array['open', 'closed'])[floor(random() * 2 + 1)],
      random() > 0.5,
      now() - (random() * interval '24 hours')
    from generate_series(1, 4);
  end loop;
  
  get diagnostics v_alerts_inserted = row_count;
  
  -- Insert 15 fall checks
  for v_rid in select unnest(v_resident_ids) loop
    insert into public.fall_checks (org_id, resident_id, age, history, gait, is_fall, confidence, processed_at)
    select
      v_org_id,
      v_rid,
      60 + floor(random() * 40)::int,
      (array['No history', 'One fall last year', 'Multiple falls', 'Recent fall incident'])[floor(random() * 4 + 1)],
      (array['normal', 'shuffling', 'unstable', 'slow'])[floor(random() * 4 + 1)],
      random() > 0.7,
      0.5 + random() * 0.5,
      now() - (random() * interval '7 days')
    from generate_series(1, 3);
  end loop;
  
  get diagnostics v_fall_checks_inserted = row_count;
  
  return jsonb_build_object(
    'residents', v_residents_inserted,
    'alerts', v_alerts_inserted,
    'fall_checks', v_fall_checks_inserted
  );
end;
$$;

grant execute on function public.seed_test_data() to authenticated;