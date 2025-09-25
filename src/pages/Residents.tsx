import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, CalendarIcon, ArrowUpDown, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/Navigation";
import { updateResident, insertResident, deleteResident, getErrorMessage } from "@/data/db";

const residentSchema = z.object({
  full_name: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100),
  dob: z.date().optional(),
  room: z.string().trim().max(10, { message: "Room number must be 10 characters or less" }).optional(),
  notes: z.string().trim().max(500).optional()
});

type ResidentForm = z.infer<typeof residentSchema>;
type SortField = 'created_at' | 'full_name';
type SortOrder = 'asc' | 'desc';

interface Resident {
  id: string;
  full_name: string;
  dob: string | null;
  room: string | null;
  notes: string | null;
  created_at: string;
}

export default function Residents() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination and sorting from URL params
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '10'));
  const [sortField, setSortField] = useState<SortField>((searchParams.get('sortField') as SortField) || 'created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sortOrder') as SortOrder) || 'desc');

  const form = useForm<ResidentForm>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: '',
      room: '',
      notes: ''
    }
  });

  // Check auth on mount and setup realtime
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      fetchResidents();
    };
    checkAuth();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('residents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'residents'
        },
        () => {
          fetchResidents();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (page !== 1) params.set('page', page.toString());
    if (pageSize !== 10) params.set('pageSize', pageSize.toString());
    if (sortField !== 'created_at') params.set('sortField', sortField);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    setSearchParams(params);
  }, [searchTerm, page, pageSize, sortField, sortOrder, setSearchParams]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 8000)
      );
      
      const dataPromise = supabase
        .from('residents')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Fetch residents error:', error);
        toast({
          title: "Error",
          description: "Failed to load residents",
          variant: "destructive"
        });
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Residents data loaded:', data?.length, 'records');
      }

      setResidents(data || []);
    } catch (error: any) {
      console.error('Fetch residents exception:', error);
      const isTimeout = error.message === 'Request timed out';
      toast({
        title: isTimeout ? "Timeout" : "Error",
        description: isTimeout ? "Request timed out. Please check your connection." : "Failed to load residents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddResident = async (data: ResidentForm) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const payload = {
        full_name: data.full_name.trim(),
        dob: data.dob ? data.dob.toISOString().split('T')[0] : null,
        room: data.room?.trim() || null,
        notes: data.notes?.trim() || null
        // org_id will be set by DB trigger
      };

      const created = await insertResident(payload);
      
      // Optimistic update
      setResidents(prev => [created, ...prev]);
      
      toast({
        title: "Success",
        description: "Resident added successfully"
      });
      
      setIsAddModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Add resident error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResident = async (data: ResidentForm) => {
    if (isSubmitting || !editingResident) return;
    
    try {
      setIsSubmitting(true);
      
      const patch = {
        full_name: data.full_name.trim(),
        dob: data.dob ? data.dob.toISOString().split('T')[0] : null,
        room: data.room?.trim() || null,
        notes: data.notes?.trim() || null
      };

      const updated = await updateResident(editingResident.id, patch);
      
      // Optimistic update
      setResidents(prev => prev.map(r => r.id === updated.id ? updated : r));
      
      toast({
        title: "Success", 
        description: "Resident updated successfully"
      });
      
      setIsEditModalOpen(false);
      setEditingResident(null);
      form.reset();
    } catch (error) {
      console.error('Update resident error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      await deleteResident(residentId);
      
      // Optimistic update
      setResidents(prev => prev.filter(r => r.id !== residentId));
      
      toast({
        title: "Success",
        description: "Resident deleted successfully"
      });
    } catch (error) {
      console.error('Delete resident error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  };

  const openEditModal = (resident: Resident) => {
    setEditingResident(resident);
    form.reset({
      full_name: resident.full_name,
      dob: resident.dob ? new Date(resident.dob) : undefined,
      room: resident.room || '',
      notes: resident.notes || ''
    });
    setIsEditModalOpen(true);
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

  const getFilteredAndSortedResidents = () => {
    const q = (searchTerm ?? '').trim().toLowerCase();
    
    let filtered = residents.filter((resident) => {
      const fullName = (resident.full_name ?? '').toLowerCase();
      const room = (resident.room ?? '').toLowerCase();
      const notes = (resident.notes ?? '').toLowerCase();
      
      return (
        q.length === 0 ||
        fullName.includes(q) ||
        room.includes(q) ||
        notes.includes(q)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else if (sortField === 'full_name') {
        aValue = a.full_name || '';
        bValue = b.full_name || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getPaginatedResidents = () => {
    const filtered = getFilteredAndSortedResidents();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredAndSortedResidents();
    return Math.ceil(filtered.length / pageSize);
  };

  const exportToCSV = () => {
    const filteredAndSortedResidents = getFilteredAndSortedResidents();
    
    const headers = ['Full Name', 'Date of Birth', 'Room', 'Notes', 'Created At'];
    const csvData = [
      headers.join(','),
      ...filteredAndSortedResidents.map(resident => [
        resident.full_name || '',
        resident.dob ? format(new Date(resident.dob), 'yyyy-MM-dd') : '',
        resident.room || '',
        resident.notes || '',
        format(new Date(resident.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'residents.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Residents exported to CSV successfully.",
    });
  };

  const ResidentFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (data: ResidentForm) => void;
    title: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter room number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter notes" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading residents...</p>
                <p className="mt-1 text-xs text-muted-foreground">This may take a moment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const paginatedResidents = getPaginatedResidents();
  const totalPages = getTotalPages();
  const filteredCount = getFilteredAndSortedResidents().length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Residents</h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resident
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search residents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Pagination Controls */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {Math.min(filteredCount, pageSize)} of {filteredCount} residents
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

        {paginatedResidents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No residents found matching your search.' : 'No residents yet.'}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resident
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('full_name')}
                        className="h-8 p-0 font-medium"
                      >
                        Full Name <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('created_at')}
                        className="h-8 p-0 font-medium"
                      >
                        Created <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">{resident.full_name}</TableCell>
                      <TableCell>
                        {resident.dob ? format(new Date(resident.dob), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>{resident.room || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{resident.notes || '-'}</TableCell>
                      <TableCell>{format(new Date(resident.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(resident)}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isSubmitting}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resident</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {resident.full_name}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteResident(resident.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <ResidentFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            form.reset();
          }}
          onSubmit={handleAddResident}
          title="Add New Resident"
        />

        <ResidentFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingResident(null);
            form.reset();
          }}
          onSubmit={handleEditResident}
          title="Edit Resident"
        />
      </div>
    </div>
  );
}