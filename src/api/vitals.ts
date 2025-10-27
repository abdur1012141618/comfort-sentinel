import { fetchView } from '@/lib/api';
import { withRetry } from '@/lib/withRetry';

export interface VitalsRecord {
  id: string;
  resident_id: string;
  org_id: string;
  created_at: string;
  heart_rate: number | null;
  temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  spo2: number | null;
  notes: string | null;
}

export interface VitalsWithResident extends VitalsRecord {
  resident_name?: string;
}

export async function getVitals(): Promise<VitalsWithResident[]> {
  return withRetry(() => 
    fetchView<VitalsRecord>("vitals", { 
      order: { column: "created_at", ascending: false }, 
      limit: 200 
    })
  );
}

export async function getResidentVitals(residentId: string): Promise<VitalsRecord[]> {
  return withRetry(() =>
    fetchView<VitalsRecord>("vitals", {
      eq: { resident_id: residentId },
      order: { column: "created_at", ascending: false },
      limit: 50
    })
  );
}
