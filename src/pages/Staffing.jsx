import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_ENDPOINT = import.meta.env.VITE_VERCEL_API_URL || 'https://comfort-sentinel.vercel.app/api/predict-staff';

export function Staffing( ) {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentShift, setCurrentShift] = useState('');

  // Function to determine the current shift
  const determineShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) {
      return 'Day';
    } else if (hour >= 14 && hour < 22) {
      return 'Evening';
    } else {
      return 'Night';
    }
  };

  useEffect(() => {
    setCurrentShift(determineShift());
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // 1. Call the Supabase RPC function
      const { data, error: rpcError } = await supabaseClient.rpc('predict_staff_needed', {
        p_shift: currentShift,
      });

      if (rpcError) {
        throw new Error(`Supabase RPC Error: ${rpcError.message}`);
      }

      // 2. Check the result from the RPC function
      if (data && data.length > 0) {
        const result = data[0];
        if (result.error_message) {
          // The RPC function returned an error from the Vercel API
          setError(result.error_message);
        } else if (result.prediction_result) {
          // Successful prediction result
          setPrediction(result.prediction_result);
        } else {
          setError('Prediction result is empty or invalid.');
        }
      } else {
        setError('Supabase RPC returned no data.');
      }
    } catch (err) {
      console.error('Prediction failed:', err);
      setError(err.message || 'An unknown error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const renderPredictionResult = () => {
    if (loading) {
      return <p className="text-center text-blue-500">{t('staffing.loading')}</p>;
    }

    if (error) {
      return (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-6 h-6 inline-block mr-2" />
          <p className="font-semibold">{t('staffing.errorTriggeringPrediction')}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }

    if (prediction) {
      return (
        <div className="text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-4xl font-bold text-green-700">{prediction.predicted_staff}</p>
          <p className="text-sm text-gray-500 mt-1">{t('staffing.staffMembersNeeded')}</p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left text-sm">
            <p className="font-semibold">{t('staffing.optimizationInsights')}</p>
            <p>{prediction.optimization_insights}</p>
          </div>
        </div>
      );
    }

    return (
      <p className="text-center text-gray-500">{t('staffing.runPredictionPrompt')}</p>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('staffing.predictiveStaffingDashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Shift Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staffing.currentShift')}</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentShift}</div>
            <p className="text-xs text-gray-500">{t('staffing.theCurrentShiftIs', { shift: currentShift })}</p>
          </CardContent>
        </Card>

        {/* Predicted Staff Card */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staffing.predictedStaffNeededForCurrentShift')}</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-full min-h-[150px] flex flex-col justify-center">
                {renderPredictionResult()}
              </div>
              <Button
                onClick={runPrediction}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? t('staffing.runningPrediction') : t('staffing.runStaffingPredictionNow')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('staffing.optimizationInsights')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {t('staffing.optimizationDescription')}
          </p>
          {/* Placeholder for more detailed insights */}
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-sm font-medium">{t('staffing.highRiskResidents')}: 5</p>
            <p className="text-sm font-medium">{t('staffing.totalResidents')}: 25</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
