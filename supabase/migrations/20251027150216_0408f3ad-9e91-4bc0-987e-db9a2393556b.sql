-- Create vitals table for resident health monitoring
CREATE TABLE public.vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  spo2 INTEGER,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view vitals in their organization
CREATE POLICY "Users can view vitals in their org"
ON public.vitals
FOR SELECT
USING (org_id = get_user_org_id());

-- RLS Policy: Users can insert vitals in their organization
CREATE POLICY "Users can insert vitals in their org"
ON public.vitals
FOR INSERT
WITH CHECK (org_id = get_user_org_id());

-- RLS Policy: Users can update vitals in their organization
CREATE POLICY "Users can update vitals in their org"
ON public.vitals
FOR UPDATE
USING (org_id = get_user_org_id())
WITH CHECK (org_id = get_user_org_id());

-- RLS Policy: Users can delete vitals in their organization
CREATE POLICY "Users can delete vitals in their org"
ON public.vitals
FOR DELETE
USING (org_id = get_user_org_id());

-- Add indexes for better query performance
CREATE INDEX idx_vitals_resident_id ON public.vitals(resident_id);
CREATE INDEX idx_vitals_org_id ON public.vitals(org_id);
CREATE INDEX idx_vitals_created_at ON public.vitals(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.vitals IS 'Stores vital signs measurements for residents';
COMMENT ON COLUMN public.vitals.heart_rate IS 'Heart rate in beats per minute';
COMMENT ON COLUMN public.vitals.temperature IS 'Body temperature in Celsius';
COMMENT ON COLUMN public.vitals.blood_pressure_systolic IS 'Systolic blood pressure in mmHg';
COMMENT ON COLUMN public.vitals.blood_pressure_diastolic IS 'Diastolic blood pressure in mmHg';
COMMENT ON COLUMN public.vitals.spo2 IS 'Blood oxygen saturation percentage';