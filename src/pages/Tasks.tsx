import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DatePickerWithManual from "@/components/DatePickerWithManual";
import { ResidentSelect } from "@/components/ResidentSelect";
import { z } from "zod";

interface Task {
  id: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  resident_id: string;
  assigned_to: string;
  created_at: string;
  residents?: {
    name: string;
    room: string;
  };
  profiles?: {
    full_name: string | null;
  };
}

const taskSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(500, "Description too long"),
  resident_id: z.string().uuid("Please select a resident"),
  assigned_to: z.string().uuid("Please select staff member"),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"], { errorMap: () => ({ message: "Please select priority" }) }),
  status: z.enum(["pending", "in_progress", "completed"], { errorMap: () => ({ message: "Please select status" }) })
});

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<Array<{ id: string; full_name: string | null }>>([]);
  const [formData, setFormData] = useState({
    description: "",
    resident_id: "",
    assigned_to: "",
    due_date: new Date(),
    priority: "",
    status: "pending"
  });

  useEffect(() => {
    loadUserProfile();
    loadStaffMembers();
  }, []);

  useEffect(() => {
    if (orgId) {
      loadTasks();
    }
  }, [orgId]);

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
      toast.error("Failed to load user profile");
    }
  };

  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error: any) {
      console.error("Failed to load staff members:", error);
      toast.error("Failed to load staff members");
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          residents (name, room),
          profiles (full_name)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Failed to load tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!orgId) {
      toast.error("Organization not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const validated = taskSchema.parse({
        description: formData.description,
        resident_id: formData.resident_id,
        assigned_to: formData.assigned_to,
        due_date: formData.due_date.toISOString(),
        priority: formData.priority,
        status: formData.status
      });

      const { error } = await supabase
        .from('tasks')
        .insert([{
          description: validated.description,
          resident_id: validated.resident_id,
          assigned_to: validated.assigned_to,
          due_date: validated.due_date,
          priority: validated.priority,
          status: validated.status,
          org_id: orgId
        }]);

      if (error) throw error;

      toast.success("Task created successfully");
      setIsAddDialogOpen(false);
      setFormData({
        description: "",
        resident_id: "",
        assigned_to: "",
        due_date: new Date(),
        priority: "",
        status: "pending"
      });
      
      loadTasks();
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
      } else {
        toast.error(e?.message || "Failed to create task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
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
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Assign a task to a staff member for a specific resident
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resident">Resident</Label>
                <ResidentSelect
                  value={formData.resident_id}
                  onChange={(value) => setFormData({ ...formData, resident_id: value })}
                  placeholder="Select resident"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger id="assigned_to">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name || staff.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <DatePickerWithManual
                  value={formData.due_date}
                  onChange={(date) => setFormData({ ...formData, due_date: date || new Date() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button onClick={handleAddTask} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium max-w-md">{task.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{task.residents?.name}</p>
                      <p className="text-sm text-muted-foreground">{task.residents?.room}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{task.profiles?.full_name || "Unassigned"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(task.due_date), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center py-10 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tasks found. Create your first task to get started.</p>
        </div>
      )}
    </div>
  );
}
