import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardCard } from '@/components/DashboardCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ackAlert, resolveAlert } from '@/api/alerts';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, Users, TrendingUp, CheckCircle2, XCircle, Database, Activity } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  
  const {
    openAlerts,
    todayAlerts,
    medianAckTime,
    recentAlerts,
    roomsAttention,
    residentsRisk,
    totalResidents,
    totalAlerts,
    dailyAlerts,
    refetchAll
  } = useDashboardData();

  const handleAck = async (id: string) => {
    try {
      setLoadingId(id);
      await ackAlert(id);
      toast({ title: "Alert acknowledged", description: "The alert has been marked as acknowledged." });
      recentAlerts.retry();
      openAlerts.retry();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to acknowledge", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setLoadingId(id);
      await resolveAlert(id);
      toast({ title: "Alert resolved", description: "The alert has been marked as resolved." });
      recentAlerts.retry();
      openAlerts.retry();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to resolve", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const { error } = await supabase.rpc('seed_test_data');
      if (error) {
        if (error.message?.includes('function') || error.code === '42883') {
          toast({
            title: "RPC Not Found",
            description: "The seed_demo function is not available. Please check your database setup.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      
      toast({
        title: "Test Data Added",
        description: "Successfully added test residents and alerts.",
      });
      
      // Refetch all dashboard data
      refetchAll();
    } catch (e: any) {
      console.error('Dashboard: Error seeding test data:', e);
      toast({
        title: "Error",
        description: e?.message ?? "Failed to add test data",
        variant: "destructive"
      });
    } finally {
      setSeeding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return <Badge variant="secondary">Unknown</Badge>;
    
    const variant = severity === 'high' ? 'destructive' : 
                   severity === 'medium' ? 'default' : 'secondary';
    return <Badge variant={variant}>{severity}</Badge>;
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of alerts, residents, and system status
            </p>
          </div>
          <Button onClick={handleSeedDemo} disabled={seeding} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            {seeding ? "Adding..." : "Add Test Data"}
          </Button>
        </div>

        {/* Stats Grid - Key Metrics */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Total Residents</CardTitle>
            </CardHeader>
            <CardContent>
              {totalResidents.loading ? (
                <div className="text-4xl font-bold text-muted-foreground">...</div>
              ) : totalResidents.error ? (
                <div className="text-sm text-destructive">{totalResidents.error}</div>
              ) : (
                <div>
                  <div className="text-5xl font-bold mb-2">{totalResidents.count}</div>
                  <p className="text-sm text-muted-foreground">
                    <Link to="/residents" className="hover:underline inline-flex items-center">
                      View all residents <Users className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {totalAlerts.loading ? (
                <div className="text-4xl font-bold text-muted-foreground">...</div>
              ) : totalAlerts.error ? (
                <div className="text-sm text-destructive">{totalAlerts.error}</div>
              ) : (
                <div>
                  <div className="text-5xl font-bold mb-2">{totalAlerts.count}</div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Open Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {openAlerts.loading ? (
                <div className="text-4xl font-bold text-muted-foreground">...</div>
              ) : openAlerts.error ? (
                <div className="text-sm text-destructive">{openAlerts.error}</div>
              ) : (
                <div>
                  <div className="text-5xl font-bold mb-2 text-destructive">{openAlerts.count}</div>
                  <p className="text-sm text-muted-foreground">
                    <Link to="/alerts" className="hover:underline inline-flex items-center">
                      View open alerts <AlertTriangle className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Alert Trends</CardTitle>
            <CardDescription>Daily alert counts over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyAlerts.loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            ) : dailyAlerts.error ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive mb-2">{dailyAlerts.error}</p>
                  <Button variant="outline" size="sm" onClick={dailyAlerts.retry}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyAlerts.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Alerts"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <DashboardCard
            title="Recent Alerts"
            description="Last 10 alerts with actions"
            loading={recentAlerts.loading}
            error={recentAlerts.error}
            onRetry={recentAlerts.retry}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAlerts.alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="text-sm">
                      {formatDate(alert.created_at)}
                    </TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>
                      {alert.status === 'open' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAck(alert.id)}
                            disabled={loadingId === alert.id}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ack
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            disabled={loadingId === alert.id}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>

          <DashboardCard
            title="Rooms Requiring Attention"
            description="Top 5 by recent events"
            loading={roomsAttention.loading}
            error={roomsAttention.error}
            onRetry={roomsAttention.retry}
          >
            <div className="space-y-3">
              {roomsAttention.rooms.map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{room.room}</p>
                    <p className="text-sm text-muted-foreground">
                      {room.event_count} events
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatDate(room.last_event).split(',')[0]}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Bottom Section */}
        <DashboardCard
          title="Residents at Risk"
          description="Last 24h fall/high-risk residents"
          loading={residentsRisk.loading}
          error={residentsRisk.error}
          onRetry={residentsRisk.retry}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {residentsRisk.residents.map((resident) => (
              <div key={resident.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{resident.full_name}</h4>
                  <Badge variant={resident.risk_score >= 70 ? 'destructive' : 'default'}>
                    {resident.risk_score}% risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Room: {resident.room || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last event: {formatDate(resident.last_event)}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>
    </>
  );
}