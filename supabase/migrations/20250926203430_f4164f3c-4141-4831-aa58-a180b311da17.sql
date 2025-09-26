-- Fix security definer view issues by recreating views as SECURITY INVOKER
DROP VIEW IF EXISTS public.v_residents;
DROP VIEW IF EXISTS public.v_alerts;
DROP VIEW IF EXISTS public.v_fall_checks;

-- Create authorized views with SECURITY INVOKER (safer approach)
CREATE VIEW public.v_residents
WITH (security_invoker = true) AS
SELECT *
FROM public.residents
WHERE org_id = public.current_org_id() OR org_id IS NULL;

CREATE VIEW public.v_alerts
WITH (security_invoker = true) AS
SELECT *
FROM public.alerts
WHERE org_id = public.current_org_id() OR org_id IS NULL;

CREATE VIEW public.v_fall_checks
WITH (security_invoker = true) AS
SELECT *
FROM public.fall_checks
WHERE org_id = public.current_org_id() OR org_id IS NULL;