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
import { AlertTriangle, Clock, Users, TrendingUp, CheckCircle2, XCircle, Database, Activity, Heart, Thermometer, Wind, Bell } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { getVitals } from '@/api/vitals';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  
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
      toast({ title: t('dashboard.ack'), description: t('alerts.alertResolved') });
      refetchAll();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message ?? t('alerts.alertResolveError'), variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setLoadingId(id);
      await resolveAlert(id);
      toast({ title: t('alerts.alertResolved'), description: t('alerts.alertResolved') });
      refetchAll();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message ?? t('alerts.alertResolveError'), variant: "destructive" });
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
        title: t('common.success'),
        description: t('dashboard.addTestData'),
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
    if (!severity) return <Badge variant="secondary">{t('common.unknown')}</Badge>;
    
    const variant = severity === 'high' ? 'destructive' : 
                   severity === 'medium' ? 'default' : 'secondary';
    return <Badge variant={variant}>{severity}</Badge>;
  };

  useEffect(() => {
    const fetchLatestVitals = async () => {
      try {
        const vitals = await getVitals();
        if (vitals && vitals.length > 0) {
          // Calculate averages for dashboard display
          const avgHeartRate = Math.round(vitals.reduce((acc, v) => acc + (v.heart_rate || 0), 0) / vitals.length);
          const avgTemp = (vitals.reduce((acc, v) => acc + (v.temperature || 0), 0) / vitals.length).toFixed(1);
          const avgSystolic = Math.round(vitals.reduce((acc, v) => acc + (v.blood_pressure_systolic || 0), 0) / vitals.length);
          const avgDiastolic = Math.round(vitals.reduce((acc, v) => acc + (v.blood_pressure_diastolic || 0), 0) / vitals.length);
          const avgSpO2 = Math.round(vitals.reduce((acc, v) => acc + (v.spo2 || 0), 0) / vitals.length);
          
          setLatestVitals({
            heartRate: avgHeartRate,
            temperature: avgTemp,
            bloodPressure: `${avgSystolic}/${avgDiastolic}`,
            spO2: avgSpO2
          });
        }
      } catch (error) {
        console.error('Error fetching vitals:', error);
      }
    };
    
    fetchLatestVitals();
  }, []);

  const getVitalStatus = (type: string, value: number) => {
    switch(type) {
      case 'heartRate':
        if (value >= 60 && value <= 100) return 'normal';
        if (value > 100 && value <= 120) return 'warning';
        return 'urgent';
      case 'temperature':
        if (value >= 36.1 && value <= 37.2) return 'normal';
        if (value >= 37.3 && value <= 38) return 'warning';
        return 'urgent';
      case 'spO2':
        if (value >= 95) return 'normal';
        if (value >= 90) return 'warning';
        return 'urgent';
      default:
        return 'normal';
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button onClick={handleSeedDemo} disabled={seeding} variant="outline">
          <Database className="h-4 w-4 mr-2" />
          {seeding ? t('dashboard.adding') : t('dashboard.addTestData')}
        </Button>
      </div>

      {/* Emergency Alerts Section */}
      {openAlerts.count > 0 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Emergency Alerts</CardTitle>
            </div>
            <CardDescription>
              {openAlerts.count} active alert{openAlerts.count !== 1 ? 's' : ''} requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="destructive" className="w-full sm:w-auto">
              <Link to="/alerts">View All Alerts</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid - Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">{t('dashboard.totalResidents')}</CardTitle>
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
                      {t('dashboard.viewAllResidents')} <Users className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">{t('dashboard.totalAlerts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {totalAlerts.loading ? (
                <div className="text-4xl font-bold text-muted-foreground">...</div>
              ) : totalAlerts.error ? (
                <div className="text-sm text-destructive">{totalAlerts.error}</div>
              ) : (
                <div>
                  <div className="text-5xl font-bold mb-2">{totalAlerts.count}</div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.allTime')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">{t('dashboard.openAlerts')}</CardTitle>
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
                      {t('dashboard.viewOpenAlerts')} <AlertTriangle className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vitals Overview Cards */}
        {latestVitals && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className={`border-l-4 ${getVitalStatus('heartRate', latestVitals.heartRate) === 'normal' ? 'border-l-vitals-normal' : getVitalStatus('heartRate', latestVitals.heartRate) === 'warning' ? 'border-l-vitals-warning' : 'border-l-vitals-urgent'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Heart className={`h-4 w-4 ${getVitalStatus('heartRate', latestVitals.heartRate) === 'normal' ? 'text-vitals-normal' : getVitalStatus('heartRate', latestVitals.heartRate) === 'warning' ? 'text-vitals-warning' : 'text-vitals-urgent'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestVitals.heartRate}</div>
                <p className="text-xs text-muted-foreground mt-1">bpm (avg)</p>
                <Badge 
                  className={`mt-2 ${
                    getVitalStatus('heartRate', latestVitals.heartRate) === 'normal' 
                      ? 'bg-vitals-normal text-vitals-normal-foreground' 
                      : getVitalStatus('heartRate', latestVitals.heartRate) === 'warning'
                      ? 'bg-vitals-warning text-vitals-warning-foreground'
                      : 'bg-vitals-urgent text-vitals-urgent-foreground'
                  }`}
                >
                  {getVitalStatus('heartRate', latestVitals.heartRate)}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-vitals-normal">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                  <Activity className="h-4 w-4 text-vitals-normal" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestVitals.bloodPressure}</div>
                <p className="text-xs text-muted-foreground mt-1">mmHg (avg)</p>
                <Badge className="mt-2 bg-vitals-normal text-vitals-normal-foreground">
                  normal
                </Badge>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${getVitalStatus('temperature', parseFloat(latestVitals.temperature)) === 'normal' ? 'border-l-vitals-normal' : getVitalStatus('temperature', parseFloat(latestVitals.temperature)) === 'warning' ? 'border-l-vitals-warning' : 'border-l-vitals-urgent'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                  <Thermometer className={`h-4 w-4 ${getVitalStatus('temperature', parseFloat(latestVitals.temperature)) === 'normal' ? 'text-vitals-normal' : getVitalStatus('temperature', parseFloat(latestVitals.temperature)) === 'warning' ? 'text-vitals-warning' : 'text-vitals-urgent'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestVitals.temperature}°C</div>
                <p className="text-xs text-muted-foreground mt-1">celsius (avg)</p>
                <Badge 
                  className={`mt-2 ${
                    getVitalStatus('temperature', parseFloat(latestVitals.temperature)) === 'normal' 
                      ? 'bg-vitals-normal text-vitals-normal-foreground' 
                      : getVitalStatus('temperature', parseFloat(latestVitals.temperature)) === 'warning'
                      ? 'bg-vitals-warning text-vitals-warning-foreground'
                      : 'bg-vitals-urgent text-vitals-urgent-foreground'
                  }`}
                >
                  {getVitalStatus('temperature', parseFloat(latestVitals.temperature))}
                </Badge>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${getVitalStatus('spO2', latestVitals.spO2) === 'normal' ? 'border-l-vitals-normal' : getVitalStatus('spO2', latestVitals.spO2) === 'warning' ? 'border-l-vitals-warning' : 'border-l-vitals-urgent'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">SpO2</CardTitle>
                  <Wind className={`h-4 w-4 ${getVitalStatus('spO2', latestVitals.spO2) === 'normal' ? 'text-vitals-normal' : getVitalStatus('spO2', latestVitals.spO2) === 'warning' ? 'text-vitals-warning' : 'text-vitals-urgent'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestVitals.spO2}%</div>
                <p className="text-xs text-muted-foreground mt-1">oxygen saturation (avg)</p>
                <Badge 
                  className={`mt-2 ${
                    getVitalStatus('spO2', latestVitals.spO2) === 'normal' 
                      ? 'bg-vitals-normal text-vitals-normal-foreground' 
                      : getVitalStatus('spO2', latestVitals.spO2) === 'warning'
                      ? 'bg-vitals-warning text-vitals-warning-foreground'
                      : 'bg-vitals-urgent text-vitals-urgent-foreground'
                  }`}
                >
                  {getVitalStatus('spO2', latestVitals.spO2)}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Chart Section */}
      <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('dashboard.alertTrends')}</CardTitle>
            <CardDescription>{t('dashboard.alertTrendsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyAlerts.loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">{t('dashboard.loadingChartData')}</p>
              </div>
            ) : dailyAlerts.error ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive mb-2">{dailyAlerts.error}</p>
                  <Button variant="outline" size="sm" onClick={dailyAlerts.retry}>
                    {t('dashboard.retry')}
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
            title={t('dashboard.recentAlerts')}
            description={t('dashboard.recentAlertsDesc')}
            loading={recentAlerts.loading}
            error={recentAlerts.error}
            onRetry={recentAlerts.retry}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.time')}</TableHead>
                  <TableHead>{t('dashboard.type')}</TableHead>
                  <TableHead>{t('dashboard.severity')}</TableHead>
                  <TableHead>{t('dashboard.actions')}</TableHead>
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
                            {t('dashboard.ack')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            disabled={loadingId === alert.id}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            {t('dashboard.resolve')}
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
            title={t('dashboard.roomsAttention')}
            description={t('dashboard.roomsAttentionDesc')}
            loading={roomsAttention.loading}
            error={roomsAttention.error}
            onRetry={roomsAttention.retry}
          >
            <div className="space-y-3">
              {roomsAttention.rooms.map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{t('dashboard.room')}: {room.room}</p>
                    <p className="text-sm text-muted-foreground">
                      {room.event_count} {t('dashboard.events')}
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
          title={t('dashboard.residentsRisk')}
          description={t('dashboard.residentsRiskDesc')}
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
                    {resident.risk_score}% {t('dashboard.risk')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('dashboard.room')}: {resident.room || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.lastEvent')}: {formatDate(resident.last_event)}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>
    </>
  );
}