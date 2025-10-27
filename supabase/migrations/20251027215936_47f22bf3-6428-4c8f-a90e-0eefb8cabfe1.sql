-- Fix resolve_alert function to use profiles table instead of non-existent users table
CREATE OR REPLACE FUNCTION public.resolve_alert(alert_id_to_resolve uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_org_id uuid;
    alert_org_id uuid;
BEGIN
    -- Get the current user's organization ID from profiles table
    SELECT org_id INTO user_org_id FROM public.profiles WHERE id = auth.uid();

    -- Check if user_org_id was found
    IF user_org_id IS NULL THEN
        RAISE EXCEPTION 'User not found or not associated with an organization.';
    END IF;

    -- Get the organization ID of the alert to be resolved
    SELECT org_id INTO alert_org_id FROM public.alerts WHERE id = alert_id_to_resolve;

    -- Check if the alert exists
    IF alert_org_id IS NULL THEN
        RAISE EXCEPTION 'Alert with ID % not found.', alert_id_to_resolve;
    END IF;

    -- Verify that the user's organization matches the alert's organization
    IF user_org_id != alert_org_id THEN
        RAISE EXCEPTION 'Permission denied: Alert does not belong to the user''s organization.';
    END IF;

    -- Update the alert status to 'resolved'
    UPDATE public.alerts
    SET status = 'resolved'
    WHERE id = alert_id_to_resolve
    AND org_id = user_org_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to resolve alert. It might already be resolved or the ID was incorrect.';
    END IF;

END;
$function$;