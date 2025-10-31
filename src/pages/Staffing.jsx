import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient'; // Adjust path as needed

// Import shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Helper function to determine the current shift for display/query purposes
const getCurrentShift = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'Day'; // 6 AM to 2 PM
  if (hour >= 14 && hour < 22) return 'Evening'; // 2 PM to 10 PM
  return 'Night'; // 10 PM to 6 AM
};

const StaffingDashboard = () => {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentShift = getCurrentShift();

  const fetchStaffingPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query the latest prediction for the current day and shift
      const { data, error } = await supabase
        .from('daily_staffing_log')
        .select('*')
        .eq('log_date', new Date().toISOString().split('T')[0]) // Current date
        .eq('shift_type', currentShift)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        throw error;
      }

      setPrediction(data);
    } catch (err) {
      console.error('Error fetching staffing prediction:', err);
      setError(t('staffing.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Function to manually trigger the prediction (calls the Supabase function)
  const triggerPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
        // Call the Supabase RPC function to run the prediction logic
        // Note: The RPC function name must match the one in your Supabase SQL
        const { data, error } = await supabase.rpc('predict_staff_needed', { shift_type: currentShift });

        if (error) {
            throw error;
        }

        // Wait a moment for the log to be inserted, then refetch
        setTimeout(() => {
            fetchStaffingPrediction();
        }, 1000);

    } catch (err) {
        console.error('Error triggering prediction:', err);
        setError(t('staffing.triggerError') + err.message);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffingPrediction();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('staffing.title')}</h1>
      
      <Alert variant="default" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('staffing.currentShift')}</AlertTitle>
        <AlertDescription>
          {t('staffing.currentShiftInfo', { shift: currentShift })}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Staffing Prediction Card */}
        <div>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-500">
                {t('staffing.staffNeeded')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : prediction ? (
                <>
                  <p className="text-6xl font-extrabold text-primary">
                    {prediction.predicted_staff}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {t('staffing.predictionTime', { time: new Date(prediction.created_at).toLocaleTimeString() })}
                  </p>
                </>
              ) : (
                <p className="text-xl font-semibold text-gray-400">
                  {t('staffing.noPrediction')}
                </p>
              )}
              
              <Button 
                onClick={triggerPrediction} 
                disabled={loading}
                className="mt-4 w-full"
              >
                <Heart className="w-4 h-4 mr-2" />
                {t('staffing.runPrediction')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Input Features Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('staffing.inputFeatures')}</CardTitle>
            </CardHeader>
            <CardContent>
              {prediction && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{t('staffing.totalResidents')}:</p>
                    <strong className="text-sm">{prediction.total_residents}</strong>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{t('staffing.highRiskResidents')}:</p>
                    <strong className="text-sm">{prediction.high_risk_residents}</strong>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{t('staffing.openAlerts')}:</p>
                    <strong className="text-sm">{prediction.open_alerts}</strong>
                  </div>
                </div>
              )}
              {!prediction && !loading && !error && (
                <p className="text-sm text-gray-500 italic">
                  {t('staffing.runToSeeFeatures')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Optimization Tips Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('staffing.optimizationTips')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {t('staffing.tip1')}
          </p>
          <p className="text-sm leading-relaxed">
            {t('staffing.tip2')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffingDashboard;

