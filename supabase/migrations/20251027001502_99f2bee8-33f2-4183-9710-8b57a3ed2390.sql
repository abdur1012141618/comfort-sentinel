-- Consolidate all data to a single organization for MVP testing
-- This migration ensures all users, residents, and alerts belong to the same organization

-- Step 1: Pick the organization with the most data (Comfort Sentinel HQ)
DO $$
DECLARE
  target_org_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Ensure the target organization exists
  INSERT INTO public.organizations (id, name, created_at)
  VALUES (target_org_id, 'Comfort Sentinel HQ', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Step 2: Update all profiles to use the target organization
  UPDATE public.profiles
  SET org_id = target_org_id
  WHERE org_id IS NULL OR org_id != target_org_id;

  -- Step 3: Update all residents to use the target organization
  UPDATE public.residents
  SET org_id = target_org_id
  WHERE org_id != target_org_id;

  -- Step 4: Update all alerts to use the target organization
  UPDATE public.alerts
  SET org_id = target_org_id
  WHERE org_id != target_org_id;

  -- Step 5: Update all fall_checks to use the target organization
  UPDATE public.fall_checks
  SET org_id = target_org_id
  WHERE org_id IS NOT NULL AND org_id != target_org_id;

  -- Step 6: Update all fall_detection_logs to use the target organization
  UPDATE public.fall_detection_logs
  SET org_id = target_org_id
  WHERE org_id != target_org_id;

END $$;

-- Verify the consolidation
-- All users should now see all the sample data