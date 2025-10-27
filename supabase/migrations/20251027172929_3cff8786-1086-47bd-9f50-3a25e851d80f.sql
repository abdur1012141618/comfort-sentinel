-- Create incidents table for incident and notes management
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  incident_type TEXT NOT NULL,
  details TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_incident_type CHECK (incident_type IN ('fall', 'behavioral', 'medical', 'note')),
  CONSTRAINT check_severity CHECK (severity IN ('minor', 'moderate', 'severe'))
);

-- Enable Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incidents table
CREATE POLICY "Users can view incidents in their org"
  ON public.incidents
  FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert incidents in their org"
  ON public.incidents
  FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update incidents in their org"
  ON public.incidents
  FOR UPDATE
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can delete incidents in their org"
  ON public.incidents
  FOR DELETE
  USING (org_id = get_user_org_id());

-- Create indexes for faster queries
CREATE INDEX idx_incidents_org_id ON public.incidents(org_id);
CREATE INDEX idx_incidents_resident_id ON public.incidents(resident_id);
CREATE INDEX idx_incidents_reported_by ON public.incidents(reported_by);
CREATE INDEX idx_incidents_incident_type ON public.incidents(incident_type);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at);
CREATE INDEX idx_incidents_resolved_at ON public.incidents(resolved_at);

-- Create updated_at trigger
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();