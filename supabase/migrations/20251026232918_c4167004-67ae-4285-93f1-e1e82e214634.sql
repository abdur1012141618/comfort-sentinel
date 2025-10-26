-- Fix the profile INSERT policy to allow first-time profile creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid() AND 
  (org_id IS NOT NULL OR org_id = gen_random_uuid())
);