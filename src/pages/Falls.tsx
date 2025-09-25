import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CalendarIcon, TestTube, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/Navigation";

interface Resident {
  id: string;
  full_name: string;
}

interface FallCheck {
  id: string;
  processed_at: string;
  resident_id: string;
  age: number;
  confidence: number;
  gait: string;
  history: string;
  is_fall: boolean;
  residents?: {
    full_name: string;
  };
}

const fallCheckSchema = z.object({
  resident_id: z.string().min(1, "Resident is required"),
  age: z.number().min(0).max(120),
  confidence: z.number().min(0).max(1).step(0.01),
  gait: z.string(),
  history: z.string().optional(),
});

type FallCheckFormData = z.infer<typeof fallCheckSchema>;
type SortField = 'processed_at' | 'resident_name';
type SortOrder = 'asc' | 'desc';

export default function Falls() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fallChecks, setFallChecks] = useState<FallCheck[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFallCheck, setEditingFallCheck] = useState<FallCheck | null>(null);
  
  // Filters from URL params
  const [selectedResident, setSelectedResident] = useState(searchParams.get('resident') || "all");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || "all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
  );
  
  // Pagination and sorting from URL params
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '10'));
  const [sortField, setSortField] = useState<SortField>((searchParams.get('sortField') as SortField) || 'processed_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sortOrder') as SortOrder) || 'desc');
  
  const isDevelopment = import.meta.env.DEV;

  const form = useForm<FallCheckFormData>({
    resolver: zodResolver(fallCheckSchema),
    defaultValues: {
      resident_id: "",
      age: 0,
      confidence: 0,
      gait: "",
      history: "",
    },
  });

  useEffect(() => {
    checkAuth();
    loadData();
    setupRealtimeSubscription();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedResident !== 'all') params.set('resident', selectedResident);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (dateFrom) params.set('dateFrom', dateFrom.toISOString());
    if (dateTo) params.set('dateTo', dateTo.toISOString());
    if (page !== 1) params.set('page', page.toString());
    if (pageSize !== 10) params.set('pageSize', pageSize.toString());
    if (sortField !== 'processed_at') params.set('sortField', sortField);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    setSearchParams(params);
  }, [selectedResident, selectedStatus, dateFrom, dateTo, page, pageSize, sortField, sortOrder, setSearchParams]);

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
      const [fallChecksResponse, residentsResponse] = await Promise.all([
        supabase
          .from('fall_checks')
          .select('*')
          .order('processed_at', { ascending: false }),
        supabase
          .from('residents')
          .select('id, full_name')
          .order('full_name')
      ]);

      if (fallChecksResponse.error) throw fallChecksResponse.error;
      if (residentsResponse.error) throw residentsResponse.error;

      setFallChecks(fallChecksResponse.data || []);
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
      .channel('fall_checks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fall_checks'
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

  const calculateIsFall = (age: number, history: string, gait: string): boolean => {
    // Simple fall detection logic based on age, history, and gait
    let score = 0;
    if (age >= 80) score += 0.3;
    if (history.toLowerCase().includes('fall')) score += 0.3;
    if (['unsteady', 'shuffling'].includes(gait.toLowerCase())) score += 0.3;
    return score >= 0.7;
  };

  const onSubmit = async (data: FallCheckFormData) => {
    setSubmitting(true);
    try {
      const is_fall = calculateIsFall(data.age, data.history || '', data.gait);
      const payload = { 
        resident_id: data.resident_id,
        age: data.age,
        confidence: data.confidence,
        gait: data.gait,
        history: data.history || '',
        is_fall
      };

      if (editingFallCheck) {
        const { error } = await supabase
          .from('fall_checks')
          .update(payload)
          .eq('id', editingFallCheck.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Fall check updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('fall_checks')
          .insert([payload]);

        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Fall check created successfully.",
        });
      }

      setIsModalOpen(false);
      setEditingFallCheck(null);
      form.reset();
      await loadData();
    } catch (error) {
      console.error('Error saving fall check:', error);
      toast({
        title: "Error",
        description: "Failed to save fall check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fallCheck: FallCheck) => {
    setEditingFallCheck(fallCheck);
    form.reset({
      resident_id: fallCheck.resident_id,
      age: fallCheck.age,
      confidence: fallCheck.confidence,
      gait: fallCheck.gait,
      history: fallCheck.history || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (fallCheck: FallCheck) => {
    if (!confirm("Are you sure you want to delete this fall check?")) return;

    try {
      const { error } = await supabase
        .from('fall_checks')
        .delete()
        .eq('id', fallCheck.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fall check deleted successfully.",
      });
      
      await loadData();
    } catch (error) {
      console.error('Error deleting fall check:', error);
      toast({
        title: "Error",
        description: "Failed to delete fall check. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openAddModal = () => {
    setEditingFallCheck(null);
    form.reset();
    setIsModalOpen(true);
  };

  const addTestData = async () => {
    try {
      setSubmitting(true);
      
      // 1. Ensure at least one resident exists
      let { data: existingResidents, error: residentsError } = await supabase
        .from('residents')
        .select('*')
        .limit(1);
        
      if (residentsError) throw residentsError;
      
      let residentId;
      if (!existingResidents || existingResidents.length === 0) {
        // Create a test resident
        const { data: newResident, error: createError } = await supabase
          .from('residents')
          .insert([{ full_name: 'Alice Smith', room: '101' }])
          .select()
          .single();
          
        if (createError) throw createError;
        residentId = newResident.id;
        
        toast({
          title: "Created test resident",
          description: "Created Alice Smith in room 101",
        });
      } else {
        residentId = existingResidents[0].id;
      }
      
      // 2. Insert a high-risk fall check
      const { error: fallCheckError } = await supabase
        .from('fall_checks')
        .insert([{
          resident_id: residentId,
          age: 85,
          gait: 'unsteady',
          history: 'Previous fall last month, uses walker',
          confidence: 0.95,
          is_fall: true
        }]);
        
      if (fallCheckError) throw fallCheckError;
      
      toast({
        title: "Success",
        description: "Test fall check created successfully!",
      });
      
      // Navigate to alerts to verify
      navigate('/alerts');
      
    } catch (error) {
      console.error('Error adding test data:', error);
      toast({
        title: "Error",
        description: "Failed to add test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  const getFilteredAndSortedFallChecks = () => {
    let filtered = fallChecks.filter(fallCheck => {
      if (selectedResident !== "all" && fallCheck.resident_id !== selectedResident) return false;
      if (selectedStatus !== "all") {
        const status = fallCheck.is_fall ? 'high' : 'normal';
        if (status !== selectedStatus) return false;
      }
      
      const checkDate = new Date(fallCheck.processed_at);
      if (dateFrom && checkDate < dateFrom) return false;
      if (dateTo && checkDate > dateTo) return false;
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'processed_at') {
        aValue = new Date(a.processed_at);
        bValue = new Date(b.processed_at);
      } else if (sortField === 'resident_name') {
        const aResident = residents.find(r => r.id === a.resident_id);
        const bResident = residents.find(r => r.id === b.resident_id);
        aValue = aResident?.full_name || 'Unknown';
        bValue = bResident?.full_name || 'Unknown';
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getPaginatedFallChecks = () => {
    const filtered = getFilteredAndSortedFallChecks();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredAndSortedFallChecks();
    return Math.ceil(filtered.length / pageSize);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const paginatedFallChecks = getPaginatedFallChecks();
  const totalPages = getTotalPages();
  const filteredCount = getFilteredAndSortedFallChecks().length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Fall Checks</h1>
          <div className="ml-auto flex gap-2">
            {isDevelopment && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addTestData}
                disabled={submitting}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Add Test Data
              </Button>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Fall Check
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingFallCheck ? "Edit Fall Check" : "New Fall Check"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="resident_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a resident" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {residents.map((resident) => (
                                <SelectItem key={resident.id} value={resident.id}>
                                  {resident.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="120"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidence (0-1)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gait"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gait</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., steady, unsteady, shuffling"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="history"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>History</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Medical history, previous falls, etc..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? "Saving..." : editingFallCheck ? "Update" : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
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
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
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
                Showing {Math.min(filteredCount, pageSize)} of {filteredCount} fall checks
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

        {/* Fall Checks Table */}
        <Card>
          <CardContent className="p-0">
            {paginatedFallChecks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fall checks found. 
                <Button variant="link" onClick={openAddModal}>Add your first fall check</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('processed_at')}
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
                    <TableHead>Age</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Gait</TableHead>
                    <TableHead>History</TableHead>
                    <TableHead>Is Fall</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFallChecks.map((fallCheck) => {
                    // Get resident name by matching resident_id
                    const resident = residents.find(r => r.id === fallCheck.resident_id);
                    
                    return (
                      <TableRow key={fallCheck.id}>
                        <TableCell>
                          {format(new Date(fallCheck.processed_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {resident?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell>{fallCheck.age}</TableCell>
                        <TableCell>
                          <span className={cn("font-medium", 
                            fallCheck.confidence >= 0.7 ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {(fallCheck.confidence * 100).toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">{fallCheck.gait}</TableCell>
                        <TableCell className="max-w-xs truncate">{fallCheck.history || "-"}</TableCell>
                        <TableCell>
                          <span className={cn("px-2 py-1 text-xs font-medium rounded-full",
                            fallCheck.is_fall 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {fallCheck.is_fall ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(fallCheck)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(fallCheck)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}