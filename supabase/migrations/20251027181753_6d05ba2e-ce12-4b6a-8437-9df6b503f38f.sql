-- Create function to calculate risk score for a resident
CREATE OR REPLACE FUNCTION public.calculate_risk_score(p_resident_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_heart_rate INTEGER;
  v_temperature NUMERIC;
  v_spo2 INTEGER;
  v_bp_systolic INTEGER;
  v_open_alerts_count INTEGER;
BEGIN
  -- Get latest vitals for the resident
  SELECT heart_rate, temperature, spo2, blood_pressure_systolic
  INTO v_heart_rate, v_temperature, v_spo2, v_bp_systolic
  FROM public.vitals
  WHERE resident_id = p_resident_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Count open alerts for the resident
  SELECT COUNT(*)
  INTO v_open_alerts_count
  FROM public.alerts
  WHERE resident_id = p_resident_id
    AND status = 'open';
  
  -- Calculate risk score based on vitals
  -- Heart rate outside 60-100 adds 10 points
  IF v_heart_rate IS NOT NULL AND (v_heart_rate < 60 OR v_heart_rate > 100) THEN
    v_risk_score := v_risk_score + 10;
  END IF;
  
  -- Temperature outside 36.1-37.2°C adds 15 points
  IF v_temperature IS NOT NULL AND (v_temperature < 36.1 OR v_temperature > 37.2) THEN
    v_risk_score := v_risk_score + 15;
  END IF;
  
  -- SpO2 below 95% adds 20 points
  IF v_spo2 IS NOT NULL AND v_spo2 < 95 THEN
    v_risk_score := v_risk_score + 20;
  END IF;
  
  -- Blood pressure systolic outside 90-140 adds 15 points
  IF v_bp_systolic IS NOT NULL AND (v_bp_systolic < 90 OR v_bp_systolic > 140) THEN
    v_risk_score := v_risk_score + 15;
  END IF;
  
  -- Open alerts add 20 points
  IF v_open_alerts_count > 0 THEN
    v_risk_score := v_risk_score + 20;
  END IF;
  
  -- Cap the score at 100
  IF v_risk_score > 100 THEN
    v_risk_score := 100;
  END IF;
  
  RETURN v_risk_score;
END;
$$;