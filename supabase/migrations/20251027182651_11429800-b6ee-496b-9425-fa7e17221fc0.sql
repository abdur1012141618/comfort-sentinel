-- Add org_id column to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON public.user_roles(org_id);

-- Drop existing policies
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_write_admin" ON public.user_roles;

-- Updated RLS policies to include org_id checks
CREATE POLICY "user_roles_select_own" 
ON public.user_roles
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_roles_select_admin" 
ON public.user_roles
FOR SELECT 
USING (
  public.auth_role() = 'admin' 
  AND org_id = public.get_user_org_id()
);

CREATE POLICY "user_roles_write_admin" 
ON public.user_roles
FOR ALL
USING (
  public.auth_role() = 'admin' 
  AND org_id = public.get_user_org_id()
)
WITH CHECK (
  public.auth_role() = 'admin' 
  AND org_id = public.get_user_org_id()
);

-- Create helper function to get users with roles in an organization
CREATE OR REPLACE FUNCTION public.get_org_users_with_roles()
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  role TEXT,
  org_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id as user_id,
    p.full_name,
    COALESCE(ur.role, 'viewer') as role,
    p.org_id
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.org_id = public.get_user_org_id();
$$;