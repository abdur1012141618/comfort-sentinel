import { fetchView } from '@/lib/api';
import { parseErr } from '@/lib/auth-utils';

export interface ResidentOption {
  value: string;
  label: string;
}

export async function listResidentsForSelect(): Promise<ResidentOption[]> {
  try {
    const residents = await fetchView<{ id: string; full_name: string; room: string | null }>(
      'v_residents',
      'id, full_name, room',
      {
        orderBy: { column: 'full_name', ascending: true },
        limit: 50
      }
    );

    return residents.map(r => ({
      value: r.id,
      label: `${r.full_name} — ${r.room || 'Unknown'}`
    }));
  } catch (err) {
    const errorMsg = parseErr(err);
    throw new Error(errorMsg);
  }
}
