import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FallCheckResponse {
  fall_detected: boolean;
  prediction_score: number;
}

const FallCheck = () => {
  const [age, setAge] = useState<string>('');
  const [gaitStabilityScore, setGaitStabilityScore] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FallCheckResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const ageNum = parseFloat(age);
    const gaitNum = parseFloat(gaitStabilityScore);
    const confNum = parseFloat(confidenceLevel);

    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      toast.error('Please enter a valid age (0-120)');
      return;
    }

    if (!gaitStabilityScore || isNaN(gaitNum) || gaitNum < 0 || gaitNum > 1) {
      toast.error('Gait stability score must be between 0 and 1');
      return;
    }

    if (!confidenceLevel || isNaN(confNum) || confNum < 0 || confNum > 1) {
      toast.error('Confidence level must be between 0 and 1');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/fall_check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: ageNum,
          gait_stability_score: gaitNum,
          confidence_level: confNum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform fall check');
      }

      const data: FallCheckResponse = await response.json();
      setResult(data);
      
      if (data.fall_detected) {
        toast.error('Fall Detected: High Risk');
      } else {
        toast.success('Fall Detected: Low Risk');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to perform fall check');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAge('');
    setGaitStabilityScore('');
    setConfidenceLevel('');
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
          <h1 className="text-xl md:text-2xl font-bold">Fall Check</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fall Risk Check</CardTitle>
              <CardDescription>
                Enter the assessment parameters to check fall risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                    disabled={loading}
                    min="0"
                    max="120"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gait">Gait Stability Score (0-1)</Label>
                  <Input
                    id="gait"
                    type="number"
                    value={gaitStabilityScore}
                    onChange={(e) => setGaitStabilityScore(e.target.value)}
                    placeholder="e.g., 0.85"
                    disabled={loading}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence Level (0-1)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(e.target.value)}
                    placeholder="e.g., 0.92"
                    disabled={loading}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Checking...' : 'Check Fall Risk'}
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
                  {result.fall_detected ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  Assessment Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Fall Detected</div>
                    <Badge 
                      variant={result.fall_detected ? "destructive" : "secondary"}
                      className="text-sm"
                    >
                      {result.fall_detected ? "TRUE" : "FALSE"}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Prediction Score</div>
                    <div className="text-lg font-semibold">
                      {(result.prediction_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default FallCheck;
