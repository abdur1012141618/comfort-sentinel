import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, ClipboardList, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Reports = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportResidentsReport = async () => {
    setLoading('residents');
    try {
      const { data: residents, error } = await supabase
        .from('residents')
        .select('*')
        .order('name');

      if (error) throw error;

      // Calculate risk scores for each resident
      const residentsWithRisk = await Promise.all(
        (residents || []).map(async (resident) => {
          const { data: riskScore } = await supabase
            .rpc('calculate_risk_score', { p_resident_id: resident.id });
          return { ...resident, risk_score: riskScore || 0 };
        })
      );

      // Generate CSV
      const headers = ['ID', 'Name', 'Room', 'Age', 'Gait', 'Risk Score', 'Notes', 'Created At'];
      const rows = residentsWithRisk.map(r => [
        r.id,
        r.name,
        r.room || '',
        r.age || '',
        r.gait || '',
        r.risk_score,
        (r.notes || '').replace(/"/g, '""'),
        format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      downloadCSV(csv, `residents_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);

      toast({
        title: t('reports.success'),
        description: t('reports.residentsExported'),
      });
    } catch (error) {
      console.error('Error exporting residents:', error);
      toast({
        title: t('reports.error'),
        description: t('reports.exportFailed'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const exportTasksReport = async () => {
    setLoading('tasks');
    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          resident:residents(name),
          assignee:profiles!tasks_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Generate CSV
      const headers = ['ID', 'Description', 'Resident', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Created At'];
      const rows = (tasks || []).map(t => [
        t.id,
        (t.description || '').replace(/"/g, '""'),
        t.resident?.name || 'N/A',
        t.status,
        t.priority,
        t.assignee?.full_name || 'Unassigned',
        format(new Date(t.due_date), 'yyyy-MM-dd'),
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      downloadCSV(csv, `tasks_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);

      toast({
        title: t('reports.success'),
        description: t('reports.tasksExported'),
      });
    } catch (error) {
      console.error('Error exporting tasks:', error);
      toast({
        title: t('reports.error'),
        description: t('reports.exportFailed'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const exportIncidentsReport = async () => {
    setLoading('incidents');
    try {
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select(`
          *,
          resident:residents(name),
          reporter:profiles!incidents_reported_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate CSV
      const headers = ['ID', 'Resident', 'Type', 'Severity', 'Details', 'Reported By', 'Created At', 'Resolved At'];
      const rows = (incidents || []).map(i => [
        i.id,
        i.resident?.name || 'N/A',
        i.incident_type,
        i.severity,
        (i.details || '').replace(/"/g, '""'),
        i.reporter?.full_name || 'Unknown',
        format(new Date(i.created_at), 'yyyy-MM-dd HH:mm:ss'),
        i.resolved_at ? format(new Date(i.resolved_at), 'yyyy-MM-dd HH:mm:ss') : 'Not Resolved'
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      downloadCSV(csv, `incidents_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);

      toast({
        title: t('reports.success'),
        description: t('reports.incidentsExported'),
      });
    } catch (error) {
      console.error('Error exporting incidents:', error);
      toast({
        title: t('reports.error'),
        description: t('reports.exportFailed'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
          <p className="text-muted-foreground">{t('reports.description')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('reports.residentsReport')}
            </CardTitle>
            <CardDescription>{t('reports.residentsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportResidentsReport}
              disabled={loading === 'residents'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === 'residents' ? t('reports.exporting') : t('reports.download')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t('reports.tasksReport')}
            </CardTitle>
            <CardDescription>{t('reports.tasksDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportTasksReport}
              disabled={loading === 'tasks'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === 'tasks' ? t('reports.exporting') : t('reports.download')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('reports.incidentsReport')}
            </CardTitle>
            <CardDescription>{t('reports.incidentsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportIncidentsReport}
              disabled={loading === 'incidents'}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === 'incidents' ? t('reports.exporting') : t('reports.download')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
