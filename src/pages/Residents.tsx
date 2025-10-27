import { useState, useEffect } from "react";
import { useResidents } from "@/hooks/useResidents";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Search, Plus, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { insertResident } from "@/data/db";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AgeInput } from "@/components/AgeInput";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { subDays, isAfter, format } from "date-fns";

// Define the structure of a Resident object
interface Resident {
  id: string;
  name: string;
  room: string;
  age: number;
  gait: string;
  notes?: string;
  created_at: string;
}

// Form validation schema
const residentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  room: z.string().trim().min(1, "Room is required").max(20, "Room number too long"),
  age: z.number().int().min(0, "Age must be positive").max(150, "Invalid age"),
  gait: z.enum(["steady", "unsteady", "slow", "shuffling"], {
    errorMap: () => ({ message: "Please select a gait type" })
  }),
  notes: z.string().max(500, "Notes too long").optional()
});

export default function Residents() {
  const { t } = useTranslation();
  const { residents, loading, error, refetch } = useResidents();
  const [searchTerm, setSearchTerm] = useState("");
  const [runningFallCheck, setRunningFallCheck] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    room: "",
    age: "",
    gait: "",
    notes: ""
  });
  const [orgId, setOrgId] = useState<string | null>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profile?.org_id) {
            setOrgId(profile.org_id);
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load residents");
    }
  }, [error]);

  useEffect(() => {
    if (selectedResident && isDetailsDialogOpen) {
      loadVitalsData(selectedResident.id);
    }
  }, [selectedResident, isDetailsDialogOpen]);

  const loadVitalsData = async (residentId: string) => {
    try {
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter to last 7 days
      const filtered = (data || []).filter((vital) =>
        isAfter(new Date(vital.created_at), sevenDaysAgo)
      );

      setVitalsData(filtered);
    } catch (error: any) {
      console.error("Error loading vitals:", error);
      toast.error("Failed to load vitals data");
    }
  };

  const handleViewDetails = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDetailsDialogOpen(true);
  };

  const handleAddResident = async () => {
    if (!orgId) {
      toast.error(t('common.error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const validated = residentSchema.parse({
        name: formData.name,
        room: formData.room,
        age: parseInt(formData.age),
        gait: formData.gait,
        notes: formData.notes || undefined
      });

      await insertResident({
        name: validated.name,
        room: validated.room,
        age: validated.age,
        gait: validated.gait,
        notes: validated.notes,
        org_id: orgId
      });

      toast.success(t('common.success'));
      setIsAddDialogOpen(false);
      setFormData({ name: "", room: "", age: "", gait: "", notes: "" });
      
      refetch();
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
      } else {
        toast.error(e?.message || t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // MODIFIED: handleFallCheck function to simulate success for testing
  const handleFallCheck = async (resident: Resident) => {
    setRunningFallCheck(resident.id);
    try {
      // ORIGINAL CODE (Heroku API Call - REMOVED)
      /*
        const response = await fetch(
            "https://protected-brook-78896.herokuapp.com/api/v1/fall_check",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resident_id: resident.id,
                    gait: resident.gait,
                    age: resident.age,
                } ),
            }
        );

        if (!response.ok) {
            throw new Error("API call failed");
        }
        */

      // ADDED: Simulate success for testing since Heroku is down
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Fall Check simulated successfully for ${resident.name}.`);
      
      // Refetch residents data to reflect any updates from the fall check
      refetch();
    } catch (e: any) {
      // ORIGINAL ERROR MESSAGE
      // toast.error(e?.message || "Error running fall check");

      // NEW ERROR MESSAGE: Inform user that the API is offline
      toast.error(`Fall Check API is offline. Please check Heroku server.`);
    } finally {
      setRunningFallCheck(null);
    }
  };

  const filteredResidents = residents.filter(
    (resident: Resident) =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || resident.room.includes(searchTerm),
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('residents.title')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('residents.addResident')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('residents.addResidentTitle')}</DialogTitle>
              <DialogDescription>
                {t('residents.addResidentDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('residents.name')}</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">{t('dashboard.room')}</Label>
                <Input
                  id="room"
                  placeholder="A-101"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">{t('residents.age')}</Label>
                <AgeInput
                  value={formData.age}
                  onChange={(v) => setFormData({ ...formData, age: String(v ?? "") })}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gait">{t('residents.gait')}</Label>
                <Select
                  value={formData.gait}
                  onValueChange={(value) => setFormData({ ...formData, gait: value })}
                >
                  <SelectTrigger id="gait">
                    <SelectValue placeholder={t('residents.selectGait')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steady">{t('residents.gaitTypes.steady')}</SelectItem>
                    <SelectItem value="unsteady">{t('residents.gaitTypes.unsteady')}</SelectItem>
                    <SelectItem value="slow">{t('residents.gaitTypes.slow')}</SelectItem>
                    <SelectItem value="shuffling">{t('residents.gaitTypes.shuffling')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">{t('residents.notes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('residents.notes')}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t('residents.cancel')}
              </Button>
              <Button onClick={handleAddResident} disabled={isSubmitting}>
                {isSubmitting ? t('residents.adding') : t('residents.add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t('residents.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('residents.name')}</TableHead>
              <TableHead>{t('dashboard.room')}</TableHead>
              <TableHead>{t('residents.age')}</TableHead>
              <TableHead>{t('residents.gait')}</TableHead>
              <TableHead>{t('residents.notes')}</TableHead>
              <TableHead>{t('residents.addedOn')}</TableHead>
              <TableHead className="text-right">{t('dashboard.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResidents.map((resident: Resident) => (
              <TableRow 
                key={resident.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewDetails(resident)}
              >
                <TableCell className="font-medium">{resident.name}</TableCell>
                <TableCell>{resident.room}</TableCell>
                <TableCell>{resident.age}</TableCell>
                <TableCell className="capitalize">{resident.gait}</TableCell>
                <TableCell>{resident.notes || "-"}</TableCell>
                <TableCell>{new Date(resident.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFallCheck(resident)}
                    disabled={runningFallCheck === resident.id || !resident.gait || !resident.age}
                  >
                    {runningFallCheck === resident.id ? (
                      t('common.loading')
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {t('navigation.fallCheck')}
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredResidents.length === 0 && !loading && (
        <div className="text-center py-10 text-muted-foreground">{t('residents.noResidents')}</div>
      )}

      {/* Resident Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resident Details
            </DialogTitle>
            <DialogDescription>
              View detailed information and vitals history
            </DialogDescription>
          </DialogHeader>

          {selectedResident && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedResident.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{selectedResident.room}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{selectedResident.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gait</p>
                  <p className="font-medium capitalize">{selectedResident.gait}</p>
                </div>
                {selectedResident.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{selectedResident.notes}</p>
                  </div>
                )}
              </div>

              {/* Vitals History and Trends Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vitals History and Trends (Last 7 Days)</h3>
                
                {vitalsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No vitals data available for the last 7 days
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Heart Rate Chart */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-4">Heart Rate (bpm)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={vitalsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at" 
                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="heart_rate" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Heart Rate"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Temperature Chart */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-4">Temperature (°C)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={vitalsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at" 
                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={2}
                            name="Temperature"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Blood Pressure Chart */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-4">Blood Pressure (mmHg)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={vitalsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at" 
                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="blood_pressure_systolic" 
                            stroke="hsl(var(--chart-1))" 
                            strokeWidth={2}
                            name="Systolic"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="blood_pressure_diastolic" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            name="Diastolic"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* SpO2 Chart */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-4">Blood Oxygen (SpO2 %)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={vitalsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at" 
                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                          />
                          <YAxis domain={[90, 100]} />
                          <Tooltip 
                            labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="spo2" 
                            stroke="hsl(var(--chart-3))" 
                            strokeWidth={2}
                            name="SpO2"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
