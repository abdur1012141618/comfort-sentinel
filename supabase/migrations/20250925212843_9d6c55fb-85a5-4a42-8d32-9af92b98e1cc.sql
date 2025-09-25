-- Create RPC functions for alert actions
CREATE OR REPLACE FUNCTION public.ack_alert(p_alert_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE alerts 
  SET is_open = false, status = 'acknowledged'
  WHERE id = p_alert_id 
    AND org_id = current_org_id()
    AND is_staff();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Alert not found or access denied';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_alert(p_alert_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE alerts 
  SET is_open = false, status = 'resolved'
  WHERE id = p_alert_id 
    AND org_id = current_org_id()
    AND is_staff();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Alert not found or access denied';
  END IF;
END;
$$;