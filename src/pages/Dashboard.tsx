import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';

const Dashboard = () => {
  const { alerts, openAlertsCount, todayAlertsCount, loading, acknowledgeAlert, resolveAlert } = useAlerts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  
  const isDevelopment = import.meta.env.DEV;

  // Session guard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const addTestData = async () => {
    if (isSeeding) return;
    
    try {
      setIsSeeding(true);
      
      // Check if residents already exist
      let { data: existingResidents, error: residentsError } = await supabase
        .from('residents')
        .select('*')
        .limit(1);
        
      if (residentsError) throw residentsError;
      
      let aliceId;
      
      if (!existingResidents || existingResidents.length === 0) {
        // Create test residents
        const { data: newResidents, error: createError } = await supabase
          .from('residents')
          .insert([
            { full_name: 'Alice Smith', room: '101' },
            { full_name: 'Bob Khan', room: '102' }
          ])
          .select();
          
        if (createError) throw createError;
        aliceId = newResidents[0].id;
      } else {
        // Use existing first resident as Alice
        aliceId = existingResidents[0].id;
      }
      
      // Insert a high-risk fall check for Alice
      const { error: fallCheckError } = await supabase
        .from('fall_checks')
        .insert([{
          resident_id: aliceId,
          age: 82,
          gait: 'unsteady',
          history: 'Previous fall detected, uses walker, seed data',
          confidence: 0.95,
          is_fall: true
        }]);
        
      if (fallCheckError) throw fallCheckError;
      
      toast({
        title: "Success",
        description: "Seeded sample data",
      });
      
      // Navigate to alerts to verify
      navigate('/alerts');
      
    } catch (error) {
      console.error('Error adding test data:', error);
      toast({
        title: "Error",
        description: "Failed to seed test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return <Badge variant="secondary">Unknown</Badge>;
    
    const variant = severity.toLowerCase() === 'high' ? 'destructive' : 
                   severity.toLowerCase() === 'medium' ? 'default' : 'secondary';
    
    return <Badge variant={variant}>{severity}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Dev Test Data Button */}
          {isDevelopment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Development Tools
                </CardTitle>
                <CardDescription>
                  Tools available only in development mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={addTestData}
                  disabled={isSeeding}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isSeeding ? 'Adding Test Data...' : 'Add Test Data'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openAlertsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Alerts requiring attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Alerts</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAlertsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Alerts created today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Last 20 alerts ordered by creation time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Created At</TableHead>
                        <TableHead className="hidden sm:table-cell">Resident ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Severity</TableHead>
                        <TableHead className="hidden lg:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="text-sm">
                            {formatDate(alert.created_at)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs font-mono">
                            {alert.resident_id ? alert.resident_id.substring(0, 8) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {alert.type || 'Unknown'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getSeverityBadge(alert.severity)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={alert.is_open ? "destructive" : "secondary"}>
                              {alert.is_open ? "Open" : "Closed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {alert.is_open ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    Ack
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => resolveAlert(alert.id)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolve
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">Closed</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;