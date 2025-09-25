import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarIcon, Download, ArrowUpDown } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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

interface Resident {
  id: string;
  full_name: string;
}

type SortField = 'created_at' | 'resident_name';
type SortOrder = 'asc' | 'desc';

export default function Alerts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters from URL params
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedResident, setSelectedResident] = useState(searchParams.get('resident') || 'all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
  );
  
  // Pagination and sorting from URL params
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '10'));
  const [sortField, setSortField] = useState<SortField>((searchParams.get('sortField') as SortField) || 'created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sortOrder') as SortOrder) || 'desc');

  useEffect(() => {
    checkAuth();
    loadData();
    setupRealtimeSubscription();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (selectedResident !== 'all') params.set('resident', selectedResident);
    if (dateFrom) params.set('dateFrom', dateFrom.toISOString());
    if (dateTo) params.set('dateTo', dateTo.toISOString());
    if (page !== 1) params.set('page', page.toString());
    if (pageSize !== 10) params.set('pageSize', pageSize.toString());
    if (sortField !== 'created_at') params.set('sortField', sortField);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    setSearchParams(params);
  }, [selectedStatus, selectedResident, dateFrom, dateTo, page, pageSize, sortField, sortOrder, setSearchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsResponse, residentsResponse] = await Promise.all([
        supabase
          .from('alerts')
          .select('*, residents(full_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('residents')
          .select('id, full_name')
          .order('full_name')
      ]);

      if (alertsResponse.error) throw alertsResponse.error;
      if (residentsResponse.error) throw residentsResponse.error;

      setAlerts(alertsResponse.data || []);
      setResidents(residentsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'closed', is_open: false })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert resolved successfully.",
      });
      
      await loadData();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting
  };

  const exportToCSV = () => {
    const filteredAndSortedAlerts = getFilteredAndSortedAlerts();
    
    const headers = ['Date', 'Resident', 'Severity', 'Type', 'Status', 'Open'];
    const csvData = [
      headers.join(','),
      ...filteredAndSortedAlerts.map(alert => [
        format(new Date(alert.created_at), 'yyyy-MM-dd HH:mm:ss'),
        alert.residents?.full_name || 'Unknown',
        alert.severity || '',
        alert.type || '',
        alert.status,
        alert.is_open ? 'Yes' : 'No'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'alerts.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Alerts exported to CSV successfully.",
    });
  };

  const getFilteredAndSortedAlerts = () => {
    let filtered = alerts.filter(alert => {
      if (selectedStatus !== "all") {
        if (selectedStatus === "open" && !alert.is_open) return false;
        if (selectedStatus === "resolved" && alert.is_open) return false;
      }
      
      if (selectedResident !== "all" && alert.resident_id !== selectedResident) return false;
      
      const alertDate = new Date(alert.created_at);
      if (dateFrom && alertDate < dateFrom) return false;
      if (dateTo && alertDate > dateTo) return false;
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else if (sortField === 'resident_name') {
        aValue = a.residents?.full_name || 'Unknown';
        bValue = b.residents?.full_name || 'Unknown';
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getPaginatedAlerts = () => {
    const filtered = getFilteredAndSortedAlerts();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredAndSortedAlerts();
    return Math.ceil(filtered.length / pageSize);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const paginatedAlerts = getPaginatedAlerts();
  const totalPages = getTotalPages();
  const filteredCount = getFilteredAndSortedAlerts().length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Resident</label>
            <Select value={selectedResident} onValueChange={setSelectedResident}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Residents</SelectItem>
                {residents.map((resident) => (
                  <SelectItem key={resident.id} value={resident.id}>
                    {resident.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-48 justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-48 justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min(filteredCount, pageSize)} of {filteredCount} alerts
            </span>
            <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(parseInt(value)); setPage(1); }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts found matching your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('created_at')}
                      className="h-8 p-0 font-medium"
                    >
                      Date <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('resident_name')}
                      className="h-8 p-0 font-medium"
                    >
                      Resident <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.residents?.full_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {alert.severity ? (
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {alert.type || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.is_open ? 'default' : 'secondary'}>
                        {alert.is_open ? 'Open' : 'Resolved'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {alert.is_open && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={loading}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}