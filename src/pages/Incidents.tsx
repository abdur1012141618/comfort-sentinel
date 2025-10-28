import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Plus, AlertCircle } from "lucide-react";
import { ResidentSelect } from "@/components/ResidentSelect";

type Incident = {
  id: string;
  incident_type: string;
  details: string;
  severity: string;
  resolved_at: string | null;
  created_at: string;
  residents: { name: string } | null;
  profiles: { full_name: string } | null;
};

type IncidentFormData = {
  resident_id: string;
  incident_type: string;
  details: string;
  severity: string;
};

const Incidents = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<IncidentFormData>({
    defaultValues: {
      resident_id: "",
      incident_type: "note",
      details: "",
      severity: "minor",
    },
  });

  // Fetch user's org_id
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch incidents
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select(`
          id,
          incident_type,
          details,
          severity,
          resolved_at,
          created_at,
          residents(name),
          profiles(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Incident[];
    },
    enabled: !!profile,
  });

  // Create incident mutation
  const createMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("incidents").insert({
        org_id: profile?.org_id,
        resident_id: data.resident_id,
        reported_by: user.id,
        incident_type: data.incident_type,
        details: data.details,
        severity: data.severity,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({
        title: t("incidents.created"),
        description: t("incidents.createdDescription"),
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncidentFormData) => {
    createMutation.mutate(data);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "destructive";
      case "moderate":
        return "default";
      case "minor":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    return t(`incidents.types.${type}`);
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("incidents.title")}</h1>
            <p className="text-muted-foreground">{t("incidents.description")}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("incidents.reportNew")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("incidents.reportNew")}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="resident_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("incidents.resident")}</FormLabel>
                        <FormControl>
                          <ResidentSelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="incident_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("incidents.type")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fall">{t("incidents.types.fall")}</SelectItem>
                            <SelectItem value="behavioral">{t("incidents.types.behavioral")}</SelectItem>
                            <SelectItem value="medical">{t("incidents.types.medical")}</SelectItem>
                            <SelectItem value="note">{t("incidents.types.note")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("incidents.severity")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="minor">{t("incidents.severities.minor")}</SelectItem>
                            <SelectItem value="moderate">{t("incidents.severities.moderate")}</SelectItem>
                            <SelectItem value="severe">{t("incidents.severities.severe")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("incidents.details")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t("common.saving") : t("incidents.report")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("incidents.type")}</TableHead>
                <TableHead>{t("incidents.resident")}</TableHead>
                <TableHead>{t("incidents.reportedBy")}</TableHead>
                <TableHead>{t("incidents.details")}</TableHead>
                <TableHead>{t("incidents.severity")}</TableHead>
                <TableHead>{t("incidents.status")}</TableHead>
                <TableHead>{t("incidents.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t("incidents.noIncidents")}
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{getIncidentTypeLabel(incident.incident_type)}</TableCell>
                    <TableCell>{incident.residents?.name || "N/A"}</TableCell>
                    <TableCell>{incident.profiles?.full_name || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">{incident.details}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {t(`incidents.severities.${incident.severity}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={incident.resolved_at ? "outline" : "default"}>
                        {incident.resolved_at ? t("incidents.resolved") : t("incidents.open")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(incident.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
  );
};

export default Incidents;
