-- ========== A) Columns নিশ্চিত ==========
alter table if exists public.residents
  add column if not exists created_at timestamptz default now() not null;

alter table if exists public.alerts
  add column if not exists created_at timestamptz default now() not null;

alter table if exists public.fall_checks
  add column if not exists created_at timestamptz default now() not null;

-- ========== B) Helpful Indexes ==========
create index if not exists idx_residents_org_created
  on public.residents (org_id, created_at desc);

create index if not exists idx_alerts_org_created
  on public.alerts (org_id, created_at desc);

create index if not exists idx_alerts_org_status
  on public.alerts (org_id, status);

create index if not exists idx_fall_checks_org_created
  on public.fall_checks (org_id, created_at desc);

-- ========== C) RLS Policies (SELECT) ==========
-- (ধরা হচ্ছে public.current_org_id() আছে)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='residents' and policyname='residents_select_org'
  ) then
    create policy residents_select_org on public.residents
      for select to authenticated
      using (org_id = public.current_org_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='alerts' and policyname='alerts_select_org'
  ) then
    create policy alerts_select_org on public.alerts
      for select to authenticated
      using (org_id = public.current_org_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='fall_checks' and policyname='fall_checks_select_org'
  ) then
    create policy fall_checks_select_org on public.fall_checks
      for select to authenticated
      using (org_id = public.current_org_id());
  end if;
end $$;

-- ========== D) Lightweight Views ==========
drop view if exists public.v_residents cascade;
create or replace view public.v_residents as
select id, org_id, full_name, room, notes, created_at
from public.residents
where org_id = public.current_org_id()
order by created_at desc
limit 200;

drop view if exists public.v_alerts cascade;
create or replace view public.v_alerts as
select id, org_id, resident_id, type, severity, status, created_at
from public.alerts
where org_id = public.current_org_id()
order by created_at desc
limit 200;

-- Views are governed by underlying table policies:
grant select on public.v_residents to authenticated;
grant select on public.v_alerts   to authenticated;