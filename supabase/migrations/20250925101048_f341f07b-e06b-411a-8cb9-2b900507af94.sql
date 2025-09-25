-- Create profiles table for user organizational data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  org_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Function to get current user's org_id (in public schema)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Add org_id column to existing tables
ALTER TABLE public.residents ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.fall_checks ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS org_id UUID;

-- Trigger function to set org_id automatically
CREATE OR REPLACE FUNCTION public.set_org_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  NEW.org_id := public.current_org_id();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auto-setting org_id
DROP TRIGGER IF EXISTS set_residents_org_id ON public.residents;
CREATE TRIGGER set_residents_org_id
  BEFORE INSERT ON public.residents
  FOR EACH ROW
  WHEN (NEW.org_id IS NULL)
  EXECUTE FUNCTION public.set_org_id_from_auth();

DROP TRIGGER IF EXISTS set_fall_checks_org_id ON public.fall_checks;
CREATE TRIGGER set_fall_checks_org_id
  BEFORE INSERT ON public.fall_checks
  FOR EACH ROW
  WHEN (NEW.org_id IS NULL)
  EXECUTE FUNCTION public.set_org_id_from_auth();

DROP TRIGGER IF EXISTS set_alerts_org_id ON public.alerts;
CREATE TRIGGER set_alerts_org_id
  BEFORE INSERT ON public.alerts
  FOR EACH ROW
  WHEN (NEW.org_id IS NULL)
  EXECUTE FUNCTION public.set_org_id_from_auth();

-- Update RLS policies to include org isolation
DROP POLICY IF EXISTS "residents_select_auth" ON public.residents;
CREATE POLICY "residents_select_auth" 
ON public.residents 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (org_id = public.current_org_id() OR org_id IS NULL));

DROP POLICY IF EXISTS "fall_checks_select_auth" ON public.fall_checks;
CREATE POLICY "fall_checks_select_auth" 
ON public.fall_checks 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (org_id = public.current_org_id() OR org_id IS NULL));

DROP POLICY IF EXISTS "alerts_select_auth" ON public.alerts;
CREATE POLICY "alerts_select_auth" 
ON public.alerts 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (org_id = public.current_org_id() OR org_id IS NULL));