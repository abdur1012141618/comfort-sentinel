import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FallCheckResult {
  is_fall: boolean;
  confidence: number;
  processed_at: string;
}

const FallCheck = () => {
  const [age, setAge] = useState<number>(65);
  const [history, setHistory] = useState<string>('');
  const [gait, setGait] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FallCheckResult | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!history || !gait) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('compute_fall_and_alert', {
        p_age: age,
        p_history: history,
        p_gait: gait
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0] as FallCheckResult;
        setResult(result);

        if (result.is_fall) {
          toast({
            title: "Fall Risk Detected",
            description: "Alert created - redirecting to dashboard",
            variant: "destructive",
          });
          
          // Navigate to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          toast({
            title: "Assessment Complete",
            description: "Fall risk assessment completed successfully",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to perform fall check",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAge(65);
    setHistory('');
    setGait('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold">Fall Risk Assessment</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Assessment Form</CardTitle>
              <CardDescription>
                Complete the form below to assess fall risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="history">Fall History</Label>
                  <Select value={history} onValueChange={setHistory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fall history" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No previous falls</SelectItem>
                      <SelectItem value="fall in last year">Fall in last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gait">Gait Assessment</Label>
                  <Select value={gait} onValueChange={setGait} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gait pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steady">Steady</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="unsteady">Unsteady</SelectItem>
                      <SelectItem value="shuffling">Shuffling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Assessing...' : 'Perform Assessment'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.is_fall ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  Assessment Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Fall Risk</div>
                    <Badge 
                      variant={result.is_fall ? "destructive" : "secondary"}
                      className="text-sm"
                    >
                      {result.is_fall ? "HIGH RISK" : "LOW RISK"}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="text-lg font-semibold">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Processed At</div>
                    <div className="text-sm">
                      {new Date(result.processed_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {result.is_fall && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Alert Created
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      A high fall risk has been detected. An alert has been created and you will be redirected to the dashboard.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default FallCheck;