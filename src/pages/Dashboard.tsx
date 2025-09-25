import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { DashboardCard } from '@/components/DashboardCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import { updateAlert } from '@/data/db';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, Users, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    openAlerts,
    todayAlerts,
    medianAckTime,
    recentAlerts,
    roomsAttention,
    residentsRisk
  } = useDashboardData();

  const { mutate: ackAlert, isPending: ackPending } = useOptimisticMutation({
    mutationFn: async (alertId: string) => {
      return updateAlert(alertId, { is_open: false });
    },
    onSuccess: () => {
      toast({ title: "Alert acknowledged", description: "The alert has been marked as acknowledged." });
      recentAlerts.retry();
      openAlerts.retry();
    }
  });

  const { mutate: resolveAlert, isPending: resolvePending } = useOptimisticMutation({
    mutationFn: async (alertId: string) => {
      return updateAlert(alertId, { status: 'resolved', is_open: false });
    },
    onSuccess: () => {
      toast({ title: "Alert resolved", description: "The alert has been marked as resolved." });
      recentAlerts.retry();
      openAlerts.retry();
    }
  });

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of alerts, residents, and system status
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <DashboardCard
            title="Open Alerts"
            loading={openAlerts.loading}
            error={openAlerts.error}
            onRetry={openAlerts.retry}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{openAlerts.count}</div>
                <p className="text-sm text-muted-foreground">
                  <Link to="/alerts?status=open" className="hover:underline">
                    View all open alerts →
                  </Link>
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Today's Alerts"
            loading={todayAlerts.loading}
            error={todayAlerts.error}
            onRetry={todayAlerts.retry}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{todayAlerts.count}</div>
                <p className="text-sm text-muted-foreground">Since midnight</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Median Ack Time"
            description="Last 7 days"
            loading={medianAckTime.loading}
            error={medianAckTime.error}
            onRetry={medianAckTime.retry}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">
                  {medianAckTime.minutes ? `${medianAckTime.minutes}min` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Average response time</p>
              </div>
            </div>
          </DashboardCard>
        </div>

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
                            onClick={() => ackAlert(alert.id)}
                            disabled={ackPending || resolvePending}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ack
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            disabled={ackPending || resolvePending}
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
      </main>
    </div>
  );
}