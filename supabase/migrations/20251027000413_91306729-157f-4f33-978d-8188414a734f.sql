-- Add RLS policies to organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Users can view their own organization
CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
USING (id = get_user_org_id());

-- Add RLS policies to fall_detection_logs table
ALTER TABLE public.fall_detection_logs ENABLE ROW LEVEL SECURITY;

-- Users can view fall detection logs in their org
CREATE POLICY "Users can view fall_detection_logs in their org"
ON public.fall_detection_logs
FOR SELECT
USING (org_id = get_user_org_id());

-- Users can insert fall detection logs in their org
CREATE POLICY "Users can insert fall_detection_logs in their org"
ON public.fall_detection_logs
FOR INSERT
WITH CHECK (org_id = get_user_org_id());

-- Users can update fall detection logs in their org
CREATE POLICY "Users can update fall_detection_logs in their org"
ON public.fall_detection_logs
FOR UPDATE
USING (org_id = get_user_org_id())
WITH CHECK (org_id = get_user_org_id());

-- Users can delete fall detection logs in their org
CREATE POLICY "Users can delete fall_detection_logs in their org"
ON public.fall_detection_logs
FOR DELETE
USING (org_id = get_user_org_id());