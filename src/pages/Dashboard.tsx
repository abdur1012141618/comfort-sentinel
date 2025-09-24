import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { alerts, openAlertsCount, todayAlertsCount, loading, acknowledgeAlert, resolveAlert } = useAlerts();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return <Badge variant="secondary">Unknown</Badge>;
    
    const variant = severity.toLowerCase() === 'high' ? 'destructive' : 
                   severity.toLowerCase() === 'medium' ? 'default' : 'secondary';
    
    return <Badge variant={variant}>{severity}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Care AI Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link to="/fall-check">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Fall Check
              </Button>
            </Link>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openAlertsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Alerts requiring attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Alerts</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAlertsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Alerts created today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Last 20 alerts ordered by creation time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Created At</TableHead>
                        <TableHead className="hidden sm:table-cell">Resident ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Severity</TableHead>
                        <TableHead className="hidden lg:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="text-sm">
                            {formatDate(alert.created_at)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs font-mono">
                            {alert.resident_id ? alert.resident_id.substring(0, 8) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {alert.type || 'Unknown'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getSeverityBadge(alert.severity)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={alert.is_open ? "destructive" : "secondary"}>
                              {alert.is_open ? "Open" : "Closed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {alert.is_open ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    Ack
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => resolveAlert(alert.id)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolve
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">Closed</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;