import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { LoadingState } from "@/components/LoadingState";
import { useDataLoader } from "@/hooks/useDataLoader";
import { resolveAlert } from "@/api/alerts";
import { parseErr } from "@/lib/auth-utils";

interface Alert {
  id: string;
  created_at: string;
  resident_id: string | null;
  severity: string | null;
  status: string;
  type: string;
  is_open: boolean;
  residents?: {
    full_name: string;
  };
}

export default function Alerts() {
  const { data: alerts, loading, error, retry, refetch } = useDataLoader<Alert>({
    table: 'alerts',
    select: '*, residents(full_name)',
    orderBy: { column: 'created_at', ascending: false }
  });

  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (alertId: string) => {
    setResolving(alertId);
    try {
      await resolveAlert(alertId);
      
      toast({
        title: "Success",
        description: "Alert resolved successfully.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: parseErr(error) || "Failed to resolve alert",
        variant: "destructive",
      });
    } finally {
      setResolving(null);
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return null;
    
    const variant = severity === 'high' ? 'destructive' : 
                  severity === 'medium' ? 'default' : 'secondary';
    
    return <Badge variant={variant}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Navigation />
      
      <LoadingState loading={loading} error={error} onRetry={retry}>
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No alerts found</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.type}</span>
                        {getSeverityBadge(alert.severity)}
                        <Badge variant={alert.is_open ? "default" : "secondary"}>
                          {alert.is_open ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      {alert.residents && (
                        <p className="text-sm text-muted-foreground">
                          Resident: {alert.residents.full_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    {alert.is_open && (
                      <Button 
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolving === alert.id}
                      >
                        {resolving === alert.id ? "Resolving..." : "Resolve"}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </LoadingState>
    </div>
  );
}