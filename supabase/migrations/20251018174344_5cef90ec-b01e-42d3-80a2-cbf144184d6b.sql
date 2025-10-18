-- Drop and recreate views, fix RLS policies for no-auth access

-- 1. Drop existing views first
DROP VIEW IF EXISTS public.v_residents CASCADE;
DROP VIEW IF EXISTS public.v_alerts CASCADE;
DROP VIEW IF EXISTS public.v_fall_checks CASCADE;

-- 2. Create v_residents view (alias 'name' as 'full_name')
CREATE VIEW public.v_residents AS
SELECT 
  id,
  org_id,
  name AS full_name,
  name,
  room,
  age,
  gait,
  notes,
  created_at
FROM public.residents;

-- 3. Create v_alerts view
CREATE VIEW public.v_alerts AS
SELECT 
  a.id,
  a.org_id,
  a.resident_id,
  a.type,
  a.status,
  a.created_at,
  r.name AS resident_name,
  r.room,
  CASE 
    WHEN a.type ILIKE '%fall%' THEN 'high'
    WHEN a.type ILIKE '%emergency%' THEN 'high'
    ELSE 'medium'
  END AS severity
FROM public.alerts a
LEFT JOIN public.residents r ON a.resident_id = r.id;

-- 4. Create v_fall_checks view
CREATE VIEW public.v_fall_checks AS
SELECT 
  id,
  org_id,
  resident_id,
  age,
  gait,
  history,
  is_fall,
  confidence,
  processed_at,
  created_at,
  raw
FROM public.fall_checks;

-- 5. Drop existing restrictive RLS policies and create public access policies
-- For residents table
DROP POLICY IF EXISTS residents_access_policy ON public.residents;
DROP POLICY IF EXISTS residents_public_access ON public.residents;
CREATE POLICY residents_public_access ON public.residents FOR ALL USING (true) WITH CHECK (true);

-- For alerts table
DROP POLICY IF EXISTS alerts_access_policy ON public.alerts;
DROP POLICY IF EXISTS alerts_public_access ON public.alerts;
CREATE POLICY alerts_public_access ON public.alerts FOR ALL USING (true) WITH CHECK (true);

-- For fall_checks table
DROP POLICY IF EXISTS fall_checks_write_staff ON public.fall_checks;
DROP POLICY IF EXISTS fall_checks_select_auth ON public.fall_checks;
DROP POLICY IF EXISTS fall_checks_select_org ON public.fall_checks;
DROP POLICY IF EXISTS fall_checks_public_access ON public.fall_checks;
CREATE POLICY fall_checks_public_access ON public.fall_checks FOR ALL USING (true) WITH CHECK (true);

-- For fall_detection_logs table
DROP POLICY IF EXISTS logs_access_policy ON public.fall_detection_logs;
DROP POLICY IF EXISTS logs_public_access ON public.fall_detection_logs;
CREATE POLICY logs_public_access ON public.fall_detection_logs FOR ALL USING (true) WITH CHECK (true);

-- For organizations table
DROP POLICY IF EXISTS orgs_access_policy ON public.organizations;
DROP POLICY IF EXISTS orgs_public_access ON public.organizations;
CREATE POLICY orgs_public_access ON public.organizations FOR ALL USING (true) WITH CHECK (true);

-- 6. Make org_id nullable in profiles (since auth is bypassed)
ALTER TABLE public.profiles ALTER COLUMN org_id DROP NOT NULL;

-- 7. Create default organization if it doesn't exist
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization')
ON CONFLICT (id) DO NOTHING;

-- 8. Create function to set default org_id
CREATE OR REPLACE FUNCTION public.set_default_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers to auto-set org_id
DROP TRIGGER IF EXISTS residents_set_default_org ON public.residents;
CREATE TRIGGER residents_set_default_org
  BEFORE INSERT ON public.residents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_org_id();

DROP TRIGGER IF EXISTS alerts_set_default_org ON public.alerts;
CREATE TRIGGER alerts_set_default_org
  BEFORE INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_org_id();

DROP TRIGGER IF EXISTS fall_checks_set_default_org ON public.fall_checks;
CREATE TRIGGER fall_checks_set_default_org
  BEFORE INSERT ON public.fall_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_org_id();