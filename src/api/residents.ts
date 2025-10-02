import { queryView } from '@/lib/supaFetch';
import { parseErr } from '@/lib/auth-utils';

export interface ResidentOption {
  value: string;
  label: string;
}

export async function listResidentsForSelect(): Promise<ResidentOption[]> {
  try {
    const residents = await queryView<{ id: string; full_name: string; room: string }>(
      'v_residents',
      'id, full_name, room',
      {
        orderBy: { column: 'full_name', ascending: true },
        limit: 50,
        timeoutMs: 8000
      }
    );

    return residents.map(r => ({
      value: r.id,
      label: `${r.full_name} (${r.room})`
    }));
  } catch (err) {
    const errorMsg = parseErr(err);
    throw new Error(errorMsg);
  }
}
