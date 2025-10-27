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
import { AlertTriangle, Search, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { insertResident } from "@/data/db";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AgeInput } from "@/components/AgeInput";
import { useTranslation } from "react-i18next";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    room: "",
    age: "",
    gait: "",
    notes: ""
  });
  const [orgId, setOrgId] = useState<string | null>(null);

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
              <TableRow key={resident.id}>
                <TableCell className="font-medium">{resident.name}</TableCell>
                <TableCell>{resident.room}</TableCell>
                <TableCell>{resident.age}</TableCell>
                <TableCell className="capitalize">{resident.gait}</TableCell>
                <TableCell>{resident.notes || "-"}</TableCell>
                <TableCell>{new Date(resident.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
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

      {/* Pagination or other elements can go here */}
    </div>
  );
}
