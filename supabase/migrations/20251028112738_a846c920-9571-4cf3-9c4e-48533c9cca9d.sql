-- Add sample vitals data for existing residents to enable risk score calculation
DO $$
DECLARE
  resident_record RECORD;
  org_uuid uuid;
BEGIN
  -- Get the org_id from the first resident
  SELECT org_id INTO org_uuid FROM residents LIMIT 1;
  
  -- Insert varied vitals for each resident
  FOR resident_record IN SELECT id FROM residents LOOP
    -- Insert vitals with some abnormal values to trigger risk scoring
    INSERT INTO vitals (org_id, resident_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, spo2, notes, created_at)
    VALUES 
      -- Recent vitals with some concerning values
      (org_uuid, resident_record.id, 55, 150, 95, 37.5, 92, 'Below normal heart rate and SpO2', NOW() - INTERVAL '1 hour'),
      (org_uuid, resident_record.id, 105, 85, 60, 36.0, 94, 'Elevated heart rate, low temp', NOW() - INTERVAL '3 hours'),
      (org_uuid, resident_record.id, 75, 120, 80, 36.8, 96, 'Normal readings', NOW() - INTERVAL '6 hours');
  END LOOP;
  
  -- Add some open alerts for a few residents to increase risk scores
  FOR resident_record IN SELECT id FROM residents LIMIT 3 LOOP
    INSERT INTO alerts (org_id, resident_id, type, status, created_at)
    VALUES 
      (org_uuid, resident_record.id, 'fall', 'open', NOW() - INTERVAL '30 minutes'),
      (org_uuid, resident_record.id, 'wandering', 'open', NOW() - INTERVAL '2 hours');
  END LOOP;
END $$;