import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const residentSchema = z.object({
  full_name: z.string().trim().min(1, { message: "Full name is required" }).max(100),
  dob: z.date().optional(),
  room: z.string().trim().max(20),
  notes: z.string().trim().max(500)
});

type ResidentForm = z.infer<typeof residentSchema>;

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
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResidentForm>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: '',
      room: '',
      notes: ''
    }
  });

  // Check auth on mount
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
  }, [navigate]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch residents error:', error);
        toast({
          title: "Error",
          description: "Failed to load residents",
          variant: "destructive"
        });
        return;
      }

      setResidents(data || []);
    } catch (error) {
      console.error('Fetch residents exception:', error);
      toast({
        title: "Error", 
        description: "Failed to load residents",
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
      
      const insertData = {
        full_name: data.full_name,
        dob: data.dob ? data.dob.toISOString().split('T')[0] : null,
        room: data.room || null,
        notes: data.notes || null
        // org_id will be set by DB trigger
      };

      const { error } = await supabase
        .from('residents')
        .insert([insertData]);

      if (error) {
        console.error('Add resident error:', error);
        toast({
          title: "Error",
          description: "Failed to add resident", 
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Resident added successfully"
      });
      
      setIsAddModalOpen(false);
      form.reset();
      fetchResidents();
    } catch (error) {
      console.error('Add resident exception:', error);
      toast({
        title: "Error",
        description: "Failed to add resident",
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
      
      const updateData = {
        full_name: data.full_name,
        dob: data.dob ? data.dob.toISOString().split('T')[0] : null,
        room: data.room || null,
        notes: data.notes || null
      };

      const { error } = await supabase
        .from('residents')
        .update(updateData)
        .eq('id', editingResident.id);

      if (error) {
        console.error('Update resident error:', error);
        toast({
          title: "Error",
          description: "Failed to update resident",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success", 
        description: "Resident updated successfully"
      });
      
      setIsEditModalOpen(false);
      setEditingResident(null);
      form.reset();
      fetchResidents();
    } catch (error) {
      console.error('Update resident exception:', error);
      toast({
        title: "Error",
        description: "Failed to update resident",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', residentId);

      if (error) {
        console.error('Delete resident error:', error);
        toast({
          title: "Error",
          description: "Failed to delete resident",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Resident deleted successfully"
      });
      
      fetchResidents();
    } catch (error) {
      console.error('Delete resident exception:', error);
      toast({
        title: "Error",
        description: "Failed to delete resident", 
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

  const filteredResidents = residents.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resident.full_name.toLowerCase().includes(searchLower) ||
      (resident.room || '').toLowerCase().includes(searchLower)
    );
  });

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Residents</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Resident
        </Button>
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

      {filteredResidents.length === 0 ? (
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
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
        </div>
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
    </div>
  );
}