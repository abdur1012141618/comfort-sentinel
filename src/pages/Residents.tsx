import { useState, useEffect } from "react";
import { useResidents } from "@/hooks/useResidents";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
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

// Define the structure of a Resident object
interface Resident {
  id: string;
  name: string;
  room: string;
  age: number;
  gait: string;
  notes?: string;
  added_at: string;
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
  const { residents, loading, error, refetch } = useResidents();
  const { user } = useAuth();
  const { profile } = useProfile(user);
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

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load residents");
    }
  }, [error]);

  const handleAddResident = async () => {
    if (!profile?.org_id) {
      toast.error("Organization not found. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate form data
      const validated = residentSchema.parse({
        name: formData.name,
        room: formData.room,
        age: parseInt(formData.age),
        gait: formData.gait,
        notes: formData.notes || undefined
      });

      // Insert resident with org_id
      await insertResident({
        name: validated.name,
        room: validated.room,
        age: validated.age,
        gait: validated.gait,
        notes: validated.notes,
        org_id: profile.org_id
      });

      toast.success("Resident added successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: "", room: "", age: "", gait: "", notes: "" });
      
      // Refresh residents list
      refetch();
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
      } else {
        toast.error(e?.message || "Failed to add resident");
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
        <h1 className="text-3xl font-bold">Residents</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Resident</DialogTitle>
              <DialogDescription>
                Enter the resident's information. All fields except notes are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="A-101"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="75"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gait">Gait</Label>
                <Select
                  value={formData.gait}
                  onValueChange={(value) => setFormData({ ...formData, gait: value })}
                >
                  <SelectTrigger id="gait">
                    <SelectValue placeholder="Select gait type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steady">Steady</SelectItem>
                    <SelectItem value="unsteady">Unsteady</SelectItem>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="shuffling">Shuffling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information..."
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
                Cancel
              </Button>
              <Button onClick={handleAddResident} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Resident"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground">Manage resident information and records</p>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gait</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{new Date(resident.added_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFallCheck(resident)}
                    disabled={runningFallCheck === resident.id || !resident.gait || !resident.age}
                  >
                    {runningFallCheck === resident.id ? (
                      "Running..."
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Fall Check
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
        <div className="text-center py-10 text-muted-foreground">No residents found.</div>
      )}

      {/* Pagination or other elements can go here */}
    </div>
  );
}
