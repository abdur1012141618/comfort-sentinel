-- Fix seed_test_data function to use correct column name 'name' instead of 'full_name'
CREATE OR REPLACE FUNCTION public.seed_test_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_org_id uuid := public.current_org_id();
  v_residents_inserted int := 0;
  v_alerts_inserted int := 0;
  v_fall_checks_inserted int := 0;
  v_resident_ids uuid[];
  v_rid uuid;
begin
  -- Insert 5 test residents with correct column name 'name'
  insert into public.residents (org_id, name, room, notes)
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
    insert into public.alerts (org_id, resident_id, type, status, created_at)
    select
      v_org_id,
      v_rid,
      (array['fall', 'wandering', 'medication'])[floor(random() * 3 + 1)],
      (array['open', 'closed', 'resolved'])[floor(random() * 3 + 1)],
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
$function$;