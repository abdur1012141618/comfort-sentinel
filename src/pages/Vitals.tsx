import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Thermometer, Wind, TrendingUp } from 'lucide-react';
import { getVitals, VitalsWithResident, getResidentVitals } from '@/api/vitals';
import { getResidents } from '@/api/residents';
import { useToast } from '@/hooks/use-toast';
import { parseErr } from '@/lib/auth-utils';
import { ResidentSelect } from '@/components/ResidentSelect';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Vitals() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [vitals, setVitals] = useState<VitalsWithResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<string>('');
  const [residentVitals, setResidentVitals] = useState<VitalsWithResident[]>([]);

  useEffect(() => {
    loadVitals();
  }, []);

  useEffect(() => {
    if (selectedResident) {
      loadResidentVitals(selectedResident);
    }
  }, [selectedResident]);

  const loadVitals = async () => {
    try {
      setLoading(true);
      
      // Fetch vitals and residents
      const [vitalsData, residentsData] = await Promise.all([
        getVitals(),
        getResidents()
      ]);

      // Create a map of resident IDs to names
      const residentMap = new Map(
        residentsData.map((r: any) => [r.id, r.name])
      );

      // Enhance vitals with resident names
      const vitalsWithNames = vitalsData.map(vital => ({
        ...vital,
        resident_name: residentMap.get(vital.resident_id) || 'Unknown'
      }));

      setVitals(vitalsWithNames);
    } catch (error) {
      const message = parseErr(error);
      console.error('Failed to load vitals:', error);
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadResidentVitals = async (residentId: string) => {
    try {
      const data = await getResidentVitals(residentId);
      const sevenDaysAgo = subDays(new Date(), 7);
      const filtered = data.filter(v => new Date(v.created_at) >= sevenDaysAgo);
      setResidentVitals(filtered);
    } catch (error) {
      console.error('Failed to load resident vitals:', error);
      toast({
        title: t('common.error'),
        description: parseErr(error),
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVitalBadge = (value: number | null, normal: [number, number]) => {
    if (!value) return <Badge variant="secondary">—</Badge>;
    
    const [min, max] = normal;
    const isNormal = value >= min && value <= max;
    
    return (
      <Badge variant={isNormal ? 'default' : 'destructive'}>
        {value}
      </Badge>
    );
  };

  const prepareChartData = () => {
    return residentVitals
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(v => ({
        date: format(new Date(v.created_at), 'MMM dd'),
        heartRate: v.heart_rate || null,
        temperature: v.temperature || null,
        systolic: v.blood_pressure_systolic || null,
        diastolic: v.blood_pressure_diastolic || null,
        spo2: v.spo2 || null,
      }));
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('vitals.title')}</h1>
          <p className="text-muted-foreground">{t('vitals.subtitle')}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('vitals.title')}</h1>
          <p className="text-muted-foreground">{t('vitals.subtitle')}</p>
        </div>
        <Button onClick={loadVitals}>
          <Activity className="h-4 w-4 mr-2" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vitals.totalRecords')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vitals.avgHeartRate')}</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.filter(v => v.heart_rate).length > 0
                ? Math.round(
                    vitals.reduce((sum, v) => sum + (v.heart_rate || 0), 0) /
                    vitals.filter(v => v.heart_rate).length
                  )
                : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vitals.avgTemp')}</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.filter(v => v.temperature).length > 0
                ? (
                    vitals.reduce((sum, v) => sum + (v.temperature || 0), 0) /
                    vitals.filter(v => v.temperature).length
                  ).toFixed(1)
                : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vitals.avgSpO2')}</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.filter(v => v.spo2).length > 0
                ? Math.round(
                    vitals.reduce((sum, v) => sum + (v.spo2 || 0), 0) /
                    vitals.filter(v => v.spo2).length
                  )
                : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('vitals.recentVitals')}</CardTitle>
          <CardDescription>{t('vitals.recentVitalsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {vitals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('vitals.noData')}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('vitals.residentName')}</TableHead>
                    <TableHead>{t('vitals.heartRate')}</TableHead>
                    <TableHead>{t('vitals.temperature')}</TableHead>
                    <TableHead>{t('vitals.bloodPressure')}</TableHead>
                    <TableHead>{t('vitals.spO2')}</TableHead>
                    <TableHead>{t('vitals.recordedAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vitals.map((vital) => (
                    <TableRow key={vital.id}>
                      <TableCell className="font-medium">
                        {vital.resident_name}
                      </TableCell>
                      <TableCell>
                        {getVitalBadge(vital.heart_rate, [60, 100])}
                      </TableCell>
                      <TableCell>
                        {vital.temperature ? (
                          <Badge variant={
                            vital.temperature >= 36.1 && vital.temperature <= 37.2
                              ? 'default'
                              : 'destructive'
                          }>
                            {vital.temperature}°C
                          </Badge>
                        ) : (
                          <Badge variant="secondary">—</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {vital.blood_pressure_systolic && vital.blood_pressure_diastolic ? (
                          <Badge variant={
                            vital.blood_pressure_systolic >= 90 &&
                            vital.blood_pressure_systolic <= 140 &&
                            vital.blood_pressure_diastolic >= 60 &&
                            vital.blood_pressure_diastolic <= 90
                              ? 'default'
                              : 'destructive'
                          }>
                            {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">—</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getVitalBadge(vital.spo2, [95, 100])}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(vital.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals History and Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('vitals.historyAndTrends')}
              </CardTitle>
              <CardDescription>{t('vitals.historyAndTrendsDesc')}</CardDescription>
            </div>
            <div className="w-64">
              <ResidentSelect
                value={selectedResident}
                onChange={setSelectedResident}
                placeholder={t('vitals.selectResident')}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedResident ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('vitals.selectResidentPrompt')}
            </div>
          ) : residentVitals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('vitals.noHistoryData')}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Heart Rate Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-vitals-normal" />
                  {t('vitals.heartRate')}
                </h3>
                <ChartContainer
                  config={{
                    heartRate: {
                      label: t('vitals.heartRate'),
                      color: 'hsl(var(--vitals-normal))',
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="heartRate" 
                        stroke="hsl(var(--vitals-normal))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--vitals-normal))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Temperature Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-vitals-warning" />
                  {t('vitals.temperature')}
                </h3>
                <ChartContainer
                  config={{
                    temperature: {
                      label: t('vitals.temperature'),
                      color: 'hsl(var(--vitals-warning))',
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[35, 40]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="hsl(var(--vitals-warning))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--vitals-warning))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Blood Pressure Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-vitals-urgent" />
                  {t('vitals.bloodPressure')}
                </h3>
                <ChartContainer
                  config={{
                    systolic: {
                      label: t('vitals.systolic'),
                      color: 'hsl(var(--vitals-urgent))',
                    },
                    diastolic: {
                      label: t('vitals.diastolic'),
                      color: 'hsl(var(--vitals-warning))',
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="systolic" 
                        stroke="hsl(var(--vitals-urgent))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--vitals-urgent))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="diastolic" 
                        stroke="hsl(var(--vitals-warning))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--vitals-warning))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* SpO2 Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wind className="h-4 w-4 text-chart-2" />
                  {t('vitals.spO2')}
                </h3>
                <ChartContainer
                  config={{
                    spo2: {
                      label: t('vitals.spO2'),
                      color: 'hsl(var(--chart-2))',
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[90, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="spo2" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-2))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
