import { useEffect, useState } from "react";
import { getResidents } from "@/api/residents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowUpDown, Search, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const residentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  age: z.number().int().min(0, "Age must be 0 or greater").max(120, "Age must be 120 or less").optional(),
  room: z.string().trim().max(50, "Room must be less than 50 characters").optional(),
  gait: z
    .enum(["normal", "slow", "shuffling", "unsteady", "steady"], {
      errorMap: () => ({ message: "Please select a valid gait type" }),
    })
    .optional(),
  notes: z.string().trim().max(500, "Notes must be less than 500 characters").optional(),
});

type Resident = {
  id: string;
  name: string; // Corrected from full_name
  age: number | null;
  room: string | null;
  gait: string | null;
  notes: string | null;
  created_at: string;
};

type SortField = "name" | "room" | "age" | "created_at";
type SortOrder = "asc" | "desc";

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [runningFallCheck, setRunningFallCheck] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "", // Corrected from full_name
    age: "",
    room: "",
    gait: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadResidents = async () => {
    try {
      setLoading(true);
      const data = await getResidents();
      setResidents(data);
      setFilteredResidents(data);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load residents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  // Search and sort
  useEffect(() => {
    let result = [...residents];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((r) => {
        const name = r.name || ""; // Corrected from full_name
        const room = r.room || "";
        const query = searchQuery.toLowerCase();
        return name.toLowerCase().includes(query) || room.toLowerCase().includes(query);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === "name") {
        aVal = (a.name || "").toLowerCase(); // Corrected from full_name
        bVal = (b.name || "").toLowerCase(); // Corrected from full_name
      } else if (sortField === "room") {
        aVal = (a.room || "").toLowerCase();
        bVal = (b.room || "").toLowerCase();
      } else if (sortField === "age") {
        aVal = a.age ?? -1;
        bVal = b.age ?? -1;
      } else {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredResidents(result);
  }, [residents, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleRunFallCheck = async (resident: Resident) => {
    // Check if resident has required data for API call
    if (!resident.age || !resident.gait) {
      toast({
        title: "Missing Data",
        description: "Resident must have age and gait information to run fall check",
        variant: "destructive",
      });
      return;
    }

    setRunningFallCheck(resident.id);
    try {
      // Call the Heroku Flask API
      const response = await fetch("https://protected-brook-78896.herokuapp.com/api/v1/fall_check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: resident.age,
          gait: resident.gait,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // Log to fall_detection_logs (using any to bypass type restrictions)
      const { error: logError } = await (supabase as any).from("fall_detection_logs").insert({
        resident_id: resident.id,
        input_data: { age: resident.age, gait: resident.gait },
        api_response: data,
        fall_detected: data.fall_detected === true,
      });

      if (logError) {
        console.error("Failed to log fall check:", logError);
      }

      // If fall detected, create alert
      if (data.fall_detected === true) {
        const { error: alertError } = await (supabase as any).from("alerts").insert({
          resident_id: resident.id,
          type: "fall",
          status: "open",
        });

        if (alertError) throw alertError;

        toast({
          title: "Fall Risk Detected!",
          description: `High fall risk detected for ${resident.name}. An alert has been created.`, // Corrected from full_name
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fall Check Complete",
          description: `No immediate fall risk detected for ${resident.name}.`, // Corrected from full_name
        });
      }
    } catch (error: any) {
      console.error("Fall check failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to run fall check",
        variant: "destructive",
      });
    } finally {
      setRunningFallCheck(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Prepare data for validation
    const dataToValidate: any = {
      name: formData.name, // Corrected from full_name
    };

    if (formData.age) {
      const ageNum = parseInt(formData.age);
      if (!isNaN(ageNum)) dataToValidate.age = ageNum;
    }
    if (formData.room) dataToValidate.room = formData.room;
    if (formData.gait) dataToValidate.gait = formData.gait;
    if (formData.notes) dataToValidate.notes = formData.notes;

    // Validate
    const validation = residentSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("residents").insert({
        name: validation.data.name, // Corrected from full_name
        age: validation.data.age ?? null,
        room: validation.data.room ?? null,
        gait: validation.data.gait ?? null,
        notes: validation.data.notes ?? null,
        org_id: "00000000-0000-0000-0000-000000000001",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resident added successfully",
      });

      // Reset form and close dialog
      setFormData({ name: "", age: "", room: "", gait: "", notes: "" }); // Corrected from full_name
      setDialogOpen(false);

      // Reload data
      await loadResidents();
    } catch (error: any) {
      console.error("Failed to add resident:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add resident",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Residents</h1>
          <p className="text-muted-foreground mt-1">Manage resident information and records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Resident</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name} // Corrected from full_name
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} // Corrected from full_name
                    placeholder="Alice Smith"
                  />
                  {formErrors.name && ( // Corrected from full_name
                    <p className="text-sm text-red-500">{formErrors.name}</p> // Corrected from full_name
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="85"
                  />
                  {formErrors.age && <p className="text-sm text-red-500">{formErrors.age}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="101"
                  />
                  {formErrors.room && <p className="text-sm text-red-500">{formErrors.room}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gait">Gait</Label>
                  <Select value={formData.gait} onValueChange={(value) => setFormData({ ...formData, gait: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gait type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="shuffling">Shuffling</SelectItem>
                      <SelectItem value="unsteady">Unsteady</SelectItem>
                      <SelectItem value="steady">Steady</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.gait && <p className="text-sm text-red-500">{formErrors.gait}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special medical notes..."
                  />
                  {formErrors.notes && <p className="text-sm text-red-500">{formErrors.notes}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Resident"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or room..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("room")}>
                Room
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("age")}>
                Age
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Gait</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("created_at")}>
                Added
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResidents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">{resident.name}</TableCell> {/* Corrected from full_name */}
                <TableCell>{resident.room}</TableCell>
                <TableCell>{resident.age}</TableCell>
                <TableCell>{resident.gait}</TableCell>
                <TableCell>{resident.notes}</TableCell>
                <TableCell>{new Date(resident.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunFallCheck(resident)}
                    disabled={runningFallCheck === resident.id || !resident.gait || !resident.age} // Added check for gait and age
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
