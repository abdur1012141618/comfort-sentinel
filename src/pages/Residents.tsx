import { useEffect, useState } from "react";
import { getResidents } from "@/api/residents";
import { toast } from "sonner";

export default function Residents() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getResidents();
        if (!cancelled) setRows(data);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load residents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-8">Loading residents...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Residents</h1>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="border p-4 rounded">
            <p className="font-semibold">{r.full_name}</p>
            <p className="text-sm text-muted-foreground">Room: {r.room || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
