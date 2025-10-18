import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchView } from "@/lib/api";
import { withRetry } from "@/lib/withRetry";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Log = {
  id: string;
  created_at: string;
  input_data: any;
  api_response: any;
  fall_detected: boolean;
  resident_id?: string;
};

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await withRetry(() =>
          fetchView<Log>("fall_detection_logs", {
            order: { column: "created_at", ascending: false },
            limit: 50,
          })
        );
        setLogs(data);
      } catch (error) {
        console.error("Failed to load logs:", error);
        toast({
          title: "Error",
          description: "Failed to load logs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Fall Detection Logs</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fall Detection Logs</h1>
        <p className="text-muted-foreground mt-2">
          View all fall detection API requests and responses
        </p>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No logs found
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {formatDate(log.created_at)}
                  </CardTitle>
                  <Badge variant={log.fall_detected ? "destructive" : "secondary"}>
                    {log.fall_detected ? "Fall Detected" : "No Fall"}
                  </Badge>
                </div>
                <CardDescription>
                  Log ID: {log.id.slice(0, 8)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.input_data && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Input Data:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(log.input_data, null, 2)}
                    </pre>
                  </div>
                )}
                {log.api_response && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">API Response:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(log.api_response, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
