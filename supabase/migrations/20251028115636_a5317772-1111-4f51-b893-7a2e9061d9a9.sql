-- Create function to check if a user has a specific role
-- This uses SECURITY DEFINER to bypass RLS and prevent recursive issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get all users in the same org with their roles
-- Only accessible by admin users
CREATE OR REPLACE FUNCTION public.get_org_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  role text,
  org_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Get the org_id of the current user
  SELECT profiles.org_id INTO _org_id
  FROM profiles
  WHERE profiles.id = auth.uid();
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view organization users';
  END IF;
  
  -- Return all users in the same organization with their roles
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    COALESCE(ur.role, 'viewer') as role,
    p.org_id
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.org_id = _org_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_users_with_roles() TO authenticated;