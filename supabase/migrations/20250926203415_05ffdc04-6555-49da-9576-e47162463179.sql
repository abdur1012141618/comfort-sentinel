-- Create authorized views for better performance and RLS simplification
CREATE OR REPLACE VIEW public.v_residents AS
SELECT *
FROM public.residents
WHERE org_id = public.current_org_id() OR org_id IS NULL;

CREATE OR REPLACE VIEW public.v_alerts AS
SELECT *
FROM public.alerts
WHERE org_id = public.current_org_id() OR org_id IS NULL;

CREATE OR REPLACE VIEW public.v_fall_checks AS
SELECT *
FROM public.fall_checks
WHERE org_id = public.current_org_id() OR org_id IS NULL;

-- Add missing org-specific RLS policies for residents
CREATE POLICY "residents_update_org" ON public.residents
FOR UPDATE
USING (org_id = public.current_org_id())
WITH CHECK (org_id = public.current_org_id());

CREATE POLICY "residents_delete_org" ON public.residents
FOR DELETE
USING (org_id = public.current_org_id());

CREATE POLICY "residents_insert_org" ON public.residents
FOR INSERT
WITH CHECK (org_id = public.current_org_id());