import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const fallCheckSchema = z.object({
  age: z.number().min(0, "Age must be positive").max(120, "Age must be realistic"),
  history: z.string().trim().min(1, "Please describe fall history"),
  gait: z.enum(['normal', 'shuffling', 'unstable', 'slow'], {
    errorMap: () => ({ message: "Please select a gait pattern" })
  })
});

interface FallCheckResult {
  is_fall: boolean;
  confidence: number;
  processed_at: string;
}

const FallCheck = () => {
  const [age, setAge] = useState<string>('');
  const [ageError, setAgeError] = useState<string>('');
  const [history, setHistory] = useState<string>('');
  const [gait, setGait] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FallCheckResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAgeError('');

    if (!age || age === '') {
      setAgeError('Age is required');
      return;
    }

    try {
      const validatedData = fallCheckSchema.parse({
        age: parseInt(age),
        history: history.trim(),
        gait: gait as 'normal' | 'shuffling' | 'unstable' | 'slow'
      });

      setLoading(true);

      const { data, error } = await supabase.rpc('compute_fall_and_alert', {
        p_age: validatedData.age,
        p_history: validatedData.history,
        p_gait: validatedData.gait
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0] as FallCheckResult;
        setResult(result);

        if (result.is_fall) {
          toast({
            title: "Alert Created",
            description: "High fall risk detected - redirecting to dashboard",
            variant: "destructive",
          });
          
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
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to perform fall check",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAge('');
    setAgeError('');
    setHistory('');
    setGait('');
    setResult(null);
    setErrors({});
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setAge(value);
      setAgeError('');
    }
  };

  const handleAgeBlur = () => {
    if (age !== '' && age !== '0') {
      const num = parseInt(age, 10);
      if (isNaN(num) || num < 0 || num > 120) {
        setAgeError('Age must be between 0 and 120');
      }
    }
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
                    type="text"
                    inputMode="numeric"
                    value={age}
                    onChange={handleAgeChange}
                    onBlur={handleAgeBlur}
                    placeholder="0-120"
                    required
                    className={ageError || errors.age ? "border-destructive" : ""}
                  />
                  {(ageError || errors.age) && (
                    <p className="text-sm text-destructive">{ageError || errors.age}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="history">Fall History</Label>
                  <Textarea
                    id="history"
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    placeholder="Describe any previous falls, injuries, or relevant medical history..."
                    rows={4}
                    className={errors.history ? "border-destructive" : ""}
                  />
                  {errors.history && (
                    <p className="text-sm text-destructive">{errors.history}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gait">Gait Assessment</Label>
                  <Select value={gait} onValueChange={setGait} required>
                    <SelectTrigger className={errors.gait ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gait pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="shuffling">Shuffling</SelectItem>
                      <SelectItem value="unstable">Unstable</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gait && (
                    <p className="text-sm text-destructive">{errors.gait}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
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
                    className="flex-1 sm:flex-initial"
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