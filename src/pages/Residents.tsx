import { useEffect, useState } from "react";
import { getResidents } from "@/lib/api";
import { toast } from "sonner";

export default function ResidentsPage() {
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

  // ... টেবিল/লিস্ট রেন্ডার করুন
}
