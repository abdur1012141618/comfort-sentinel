// imports
import { useEffect, useState } from "react";
import { getAlerts, resolveAlert } from "@/lib/api";
import { toast } from "sonner"; // বা আপনার Toast

export default function AlertsPage() {
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
      // Optimistic UI
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "closed" } : r)));
      toast.success("Alert resolved");
    } catch (e: any) {
      toast.error(e?.message || "Resolve failed");
    }
  };

  // ... আপনার UI, যেখানে Resolve বাটন ছিল:
  // <Button onClick={() => onResolve(row.id)}>Resolve</Button>
}
