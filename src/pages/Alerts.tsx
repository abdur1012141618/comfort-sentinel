import { useEffect, useState } from "react";
import { getAlerts } from "@/api/alerts";
import { resolveAlert } from "@/api/alerts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Alerts() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAlerts();
        if (!cancelled) setRows(data);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load alerts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "closed" } : r)));
      toast.success("Alert resolved");
    } catch (e: any) {
      toast.error(e?.message || "Resolve failed");
    }
  };

  if (loading) return <div className="p-8">Loading alerts...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Alerts</h1>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.type}</p>
              <p className="text-sm text-muted-foreground">Status: {r.status}</p>
            </div>
            <Button onClick={() => onResolve(r.id)} disabled={r.status === "closed"}>
              Resolve
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
