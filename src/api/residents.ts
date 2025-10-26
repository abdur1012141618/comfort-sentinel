import { fetchView } from '@/lib/api';
import { withRetry } from '@/lib/withRetry';
import { parseErr } from '@/lib/auth-utils';

export interface ResidentOption {
  value: string;
  label: string;
}

export async function getResidents() {
  return withRetry(() => 
    fetchView("residents", { 
      order: { column: "created_at", ascending: false }, 
      limit: 200 
    })
  );
}

export async function listResidentsForSelect(): Promise<ResidentOption[]> {
  try {
    const residents = await withRetry(() =>
      fetchView<{ id: string; name: string; room: string | null }>(
        'residents',
        {
          select: 'id, name, room',
          order: { column: 'name', ascending: true },
          limit: 50
        }
      )
    );

    return residents.map(r => ({
      value: r.id,
      label: `${r.name} — ${r.room || 'Unknown'}`
    }));
  } catch (err) {
    const errorMsg = parseErr(err);
    throw new Error(errorMsg);
  }
}
