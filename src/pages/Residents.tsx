import { useState, useEffect } from "react";
import { useResidents } from "@/hooks/useResidents";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Residents() {
  const { residents, loading, error } = useResidents();
  const [searchTerm, setSearchTerm] = useState("");
  const [runningFallCheck, setRunningFallCheck] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load residents");
    }
  }, [error]);

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
        <Button onClick={() => toast.info("New resident feature not implemented yet")}>+ Add New Resident</Button>
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
