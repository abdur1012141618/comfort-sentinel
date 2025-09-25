import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Edit, Trash2, CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

export default function Falls() {
  const navigate = useNavigate();
  const [fallChecks, setFallChecks] = useState<FallCheck[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFallCheck, setEditingFallCheck] = useState<FallCheck | null>(null);
  
  // Filters
  const [selectedResident, setSelectedResident] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

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

  const filteredFallChecks = fallChecks.filter(fallCheck => {
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Fall Checks</h1>
        <div className="ml-auto">
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

      {/* Fall Checks Table */}
      <Card>
        <CardContent className="p-0">
          {filteredFallChecks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fall checks found. 
              <Button variant="link" onClick={openAddModal}>Add your first fall check</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Gait</TableHead>
                  <TableHead>History</TableHead>
                  <TableHead>Is Fall</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFallChecks.map((fallCheck) => {
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
  );
}