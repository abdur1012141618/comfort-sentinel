import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Edit, Save, Trash2, X, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address")
});

type OrgUser = {
  user_id: string;
  full_name: string | null;
  role: string;
  org_id: string;
};

export default function Settings() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "" });
  const { profile, fetchProfile } = useProfile(user);
  const navigate = useNavigate();
  
  // Role management state
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Check if user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          setIsAdmin(roleData?.role === 'admin');
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  
  // Load organization users if admin
  useEffect(() => {
    const loadOrgUsers = async () => {
      if (!isAdmin) return;
      
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase.rpc('get_org_users_with_roles');
        
        if (error) throw error;
        
        setOrgUsers(data || []);
      } catch (error) {
        console.error("Failed to load org users:", error);
        toast({
          title: "Error",
          description: "Failed to load organization users",
          variant: "destructive"
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadOrgUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (user || profile) {
      setFormData({ 
        full_name: profile?.full_name || "", 
        email: user?.email || "" 
      });
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const validated = profileSchema.parse(formData);
      
      // Update email if changed
      if (validated.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: validated.email
        });
        
        if (authError) throw authError;
        
        toast({
          title: t('settings.emailUpdateTitle'),
          description: t('settings.emailUpdateDesc')
        });
      }
      
      // Update profile full_name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: validated.full_name })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      toast({
        title: t('common.success'),
        description: t('settings.profileUpdated')
      });
      setIsEditMode(false);
      
      if (fetchProfile) {
        await fetchProfile(user.id);
      }
      
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) setUser(updatedUser);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('settings.validationError'),
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t('common.error'),
          description: error.message || t('settings.profileUpdateFailed'),
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: t('settings.accountDeletionTitle'),
        description: t('settings.accountDeletionDesc')
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('settings.profileUpdateFailed'),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userToUpdate = orgUsers.find(u => u.user_id === userId);
      if (!userToUpdate) return;
      
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: newRole,
            org_id: userToUpdate.org_id 
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setOrgUsers(orgUsers.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));
      
      toast({
        title: t('common.success'),
        description: t('settings.roleUpdated')
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('settings.roleUpdateFailed'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <Card>
          <CardContent className="py-8 text-center">{t('settings.loading')}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profileInfo')}</CardTitle>
          <CardDescription>
            {t('settings.profileInfoDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('settings.email')}</Label>
            <Input
              id="email"
              type="email"
              value={isEditMode ? formData.email : (user?.email || "")}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditMode}
              className={!isEditMode ? "bg-muted" : ""}
            />
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                {t('settings.emailChangeNotice')}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">{t('settings.fullName')}</Label>
            <Input
              id="full_name"
              type="text"
              value={isEditMode ? formData.full_name : (profile?.full_name || t('settings.notSet'))}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditMode}
              className={!isEditMode ? "bg-muted" : ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.accountInfo')}</CardTitle>
          <CardDescription>
            {t('settings.accountInfoDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('settings.userId')}:</span>
              <span className="text-sm font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('settings.created')}:</span>
              <span className="text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : t('settings.na')}
              </span>
            </div>
            {profile?.org_id && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.organizationId')}:</span>
                <span className="text-sm font-mono">{profile.org_id}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex gap-2">
              {!isEditMode ? (
                <Button
                  variant="default"
                  onClick={() => setIsEditMode(true)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t('settings.editProfile')}
                </Button>
              ) : (
                <>
                  <Button
                    variant="default"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false);
                      setFormData({ 
                        full_name: profile?.full_name || "", 
                        email: user?.email || "" 
                      });
                    }}
                    disabled={isSaving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('settings.cancel')}
                  </Button>
                </>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? t('settings.processing') : t('settings.deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.deleteConfirmDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('settings.deleteAccount')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t('settings.roleManagement')}</CardTitle>
            </div>
            <CardDescription>
              {t('settings.roleManagementDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('settings.userName')}</TableHead>
                    <TableHead>{t('settings.userId')}</TableHead>
                    <TableHead>{t('settings.role')}</TableHead>
                    <TableHead>{t('settings.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgUsers.map((orgUser) => (
                    <TableRow key={orgUser.user_id}>
                      <TableCell className="font-medium">
                        {orgUser.full_name || t('settings.noName')}
                        {orgUser.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2">
                            {t('settings.you')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {orgUser.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          orgUser.role === 'admin' ? 'default' : 
                          orgUser.role === 'caregiver' ? 'default' :
                          orgUser.role === 'nurse' ? 'secondary' : 
                          'outline'
                        }>
                          {t(`settings.roles.${orgUser.role}`, orgUser.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={orgUser.role}
                          onValueChange={(value) => handleRoleChange(orgUser.user_id, value)}
                          disabled={orgUser.user_id === user?.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">{t('settings.roles.admin')}</SelectItem>
                            <SelectItem value="nurse">{t('settings.roles.nurse')}</SelectItem>
                            <SelectItem value="staff">{t('settings.roles.staff')}</SelectItem>
                            <SelectItem value="viewer">{t('settings.roles.viewer')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
