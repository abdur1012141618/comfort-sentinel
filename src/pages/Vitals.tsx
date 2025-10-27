import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Thermometer, Wind } from 'lucide-react';
import { getVitals, VitalsWithResident } from '@/api/vitals';
import { getResidents } from '@/api/residents';
import { useToast } from '@/hooks/use-toast';
import { parseErr } from '@/lib/auth-utils';

export default function Vitals() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [vitals, setVitals] = useState<VitalsWithResident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVitals();
  }, []);

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
    </div>
  );
}
