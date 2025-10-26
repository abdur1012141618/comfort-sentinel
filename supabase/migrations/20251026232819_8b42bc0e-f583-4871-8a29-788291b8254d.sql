-- Helper function to get current user's org_id from profiles
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fall_checks ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "allow_all_update_alerts_for_testing" ON public.alerts;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Residents policies (org-scoped)
CREATE POLICY "Users can view residents in their org"
ON public.residents FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert residents in their org"
ON public.residents FOR INSERT
TO authenticated
WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update residents in their org"
ON public.residents FOR UPDATE
TO authenticated
USING (org_id = public.get_user_org_id())
WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete residents in their org"
ON public.residents FOR DELETE
TO authenticated
USING (org_id = public.get_user_org_id());

-- Alerts policies (org-scoped)
CREATE POLICY "Users can view alerts in their org"
ON public.alerts FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert alerts in their org"
ON public.alerts FOR INSERT
TO authenticated
WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update alerts in their org"
ON public.alerts FOR UPDATE
TO authenticated
USING (org_id = public.get_user_org_id())
WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete alerts in their org"
ON public.alerts FOR DELETE
TO authenticated
USING (org_id = public.get_user_org_id());

-- Fall checks policies (org-scoped)
CREATE POLICY "Users can view fall_checks in their org"
ON public.fall_checks FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert fall_checks in their org"
ON public.fall_checks FOR INSERT
TO authenticated
WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update fall_checks in their org"
ON public.fall_checks FOR UPDATE
TO authenticated
USING (org_id = public.get_user_org_id())
WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete fall_checks in their org"
ON public.fall_checks FOR DELETE
TO authenticated
USING (org_id = public.get_user_org_id());