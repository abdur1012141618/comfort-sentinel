import { useEffect, useState } from "react";
import { getAlerts } from "@/api/alerts";
// import { resolveAlert } from "@/api/alerts"; // REMOVED: We will use direct supabase call
import { supabase } from "@/integrations/supabase/client"; // ADDED: Import supabase client
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  status: string;
  created_at: string;
  resident_id?: string;
  resident_name?: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      // Filter to only show open alerts
      const openAlerts = data.filter((alert: Alert) => alert.status === "open");
      setAlerts(openAlerts);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // MODIFIED: Use direct Supabase call to resolve the alert
  const handleResolve = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      // Direct Supabase call to update the alert status to 'resolved'
      const { error } = await supabase.from("alerts").update({ status: "resolved" }).eq("id", alertId);

      if (error) throw error;

      // Remove resolved alert from the list since we only show open alerts
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Alert resolved successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to resolve alert");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Open Alerts</h1>
        <p className="text-muted-foreground">Active alerts requiring attention ({alerts.length} open)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Active Alerts
          </CardTitle>
          <CardDescription>Alerts that need to be resolved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <p>No open alerts. All clear!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium capitalize">{alert.type}</TableCell>
                      <TableCell>{alert.resident_name || `Resident ${alert.resident_id?.slice(0, 8)}`}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
                          {alert.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolvingId === alert.id}
                        >
                          {resolvingId === alert.id ? (
                            "Resolving..."
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolve
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
