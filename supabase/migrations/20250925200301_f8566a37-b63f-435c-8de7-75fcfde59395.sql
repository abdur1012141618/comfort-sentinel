-- Create ensure_profile RPC function
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  profile_record profiles%ROWTYPE;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Try to get existing profile
  SELECT * INTO profile_record FROM profiles WHERE id = user_id;
  
  -- If no profile exists, create one
  IF NOT FOUND THEN
    INSERT INTO profiles (id, org_id, role)
    VALUES (user_id, gen_random_uuid(), 'staff')
    RETURNING * INTO profile_record;
  END IF;

  -- Return the profile as JSON
  RETURN jsonb_build_object(
    'id', profile_record.id,
    'org_id', profile_record.org_id,
    'role', profile_record.role,
    'created_at', profile_record.created_at,
    'updated_at', profile_record.updated_at
  );
END;
$$;