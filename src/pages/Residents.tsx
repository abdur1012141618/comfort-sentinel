import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CalendarIcon } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { LoadingState } from "@/components/LoadingState";
import { useDataLoader } from "@/hooks/useDataLoader";
import { insertResident, updateResident, deleteResident } from "@/data/db";
import { parseErr } from "@/lib/auth-utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const residentSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  age: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 0 && num <= 120;
  }, "Age must be between 0 and 120"),
  dob: z.date().optional().nullable(),
  room: z.string().trim().max(10, "Room must be 10 characters or less").optional(),
  notes: z.string().trim().max(500).optional()
});

type ResidentForm = z.infer<typeof residentSchema>;

interface Resident {
  id: string;
  full_name: string;
  age?: number | null;
  dob: string | null;
  room: string | null;
  notes: string | null;
  created_at: string;
}

export default function Residents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { data: residents, loading, error, retry, refetch } = useDataLoader<Resident>({
    table: 'residents',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<ResidentForm>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: '',
      age: '',
      dob: null,
      room: '',
      notes: ''
    }
  });

  const handleAdd = async (values: ResidentForm) => {
    setSaving(true);
    try {
      const payload = {
        full_name: values.full_name.trim(),
        age: values.age && values.age !== '' ? parseInt(values.age, 10) : null,
        dob: values.dob ? format(values.dob, 'yyyy-MM-dd') : null,
        room: values.room?.trim() || null,
        notes: values.notes?.trim() || null
      };
      
      await insertResident(payload);
      toast({ title: "Success", description: "Resident added successfully" });
      form.reset();
      setIsAddOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: parseErr(error),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values: ResidentForm) => {
    if (!editingResident) return;
    
    setSaving(true);
    try {
      const payload = {
        full_name: values.full_name.trim(),
        age: values.age && values.age !== '' ? parseInt(values.age, 10) : null,
        dob: values.dob ? format(values.dob, 'yyyy-MM-dd') : null,
        room: values.room?.trim() || null,
        notes: values.notes?.trim() || null
      };
      
      await updateResident(editingResident.id, payload);
      toast({ title: "Success", description: "Resident updated successfully" });
      form.reset();
      setIsEditOpen(false);
      setEditingResident(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error", 
        description: parseErr(error),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResident(id);
      toast({ title: "Success", description: "Resident deleted successfully" });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: parseErr(error),
        variant: "destructive"
      });
    }
  };

  const openEdit = (resident: Resident) => {
    setEditingResident(resident);
    form.reset({
      full_name: resident.full_name,
      age: resident.age ? resident.age.toString() : '',
      dob: resident.dob ? new Date(resident.dob) : null,
      room: resident.room || '',
      notes: resident.notes || ''
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <Navigation />
      
      <LoadingState loading={loading} error={error} onRetry={retry}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Residents</CardTitle>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resident
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Resident</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={saving} />
                            </FormControl>
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
                                type="text"
                                inputMode="numeric"
                                disabled={saving}
                                placeholder="0-120"
                                value={field.value || ''}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/[^\d]/g, "");
                                  if (v === "") { field.onChange(""); return; }
                                  let n = Math.min(120, parseInt(v, 10));
                                  const clean = Number.isNaN(n) ? "" : String(n);
                                  field.onChange(clean);
                                }}
                              />
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
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={saving}
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
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  captionLayout="dropdown"
                                  fromYear={2015}
                                  toYear={2035}
                                  initialFocus
                                  className="pointer-events-auto"
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
                            <FormLabel>Room</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={saving} />
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
                              <Textarea {...field} disabled={saving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={saving}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {residents.map((resident) => (
                <div key={resident.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{resident.full_name}</h3>
                    {resident.room && <p className="text-sm text-muted-foreground">Room: {resident.room}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(resident)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(resident.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </LoadingState>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={saving} />
                    </FormControl>
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
                        type="text"
                        inputMode="numeric"
                        disabled={saving}
                        placeholder="0-120"
                        value={field.value || ''}
                        onChange={(e) => {
                          let v = e.target.value.replace(/[^\d]/g, "");
                          if (v === "") { field.onChange(""); return; }
                          let n = Math.min(120, parseInt(v, 10));
                          const clean = Number.isNaN(n) ? "" : String(n);
                          field.onChange(clean);
                        }}
                      />
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
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={saving}
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                          fromYear={2015}
                          toYear={2035}
                          initialFocus
                          className="pointer-events-auto"
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
                    <FormLabel>Room</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={saving} />
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
                      <Textarea {...field} disabled={saving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}