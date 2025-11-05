import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient'; // <--- এই লাইনটি ঠিক করা হয়েছে
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_ENDPOINT = import.meta.env.VITE_VERCEL_API_URL || 'https://comfort-sentinel.vercel.app/api/predict-staff';

export default function Staffing( ) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentShift, setCurrentShift] = useState('');
  const { t } = useTranslation();

  // function to determine the current shift
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
      // 1. Fetch resident data from Supabase
      const { data: residents, error: residentsError } = await supabaseClient
        .from('residents')
        .select('acuity_level, incident_history');

      if (residentsError) {
        throw new Error(residentsError.message);
      }

      // 2. Prepare data for Vercel API
      const inputData = {
        shift: currentShift,
        residents: residents.map(r => ({
          acuity_level: r.acuity_level,
          incident_history: r.incident_history,
        })),
      };

      // 3. Call Vercel API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vercel API Network Error: Could not reach ${API_ENDPOINT} (STATUS: ${response.status}) - ${errorText}`);
      }

      const result = await response.json();
      setPrediction(result);

    } catch (err) {
      console.error('Prediction Error:', err);
      setError(err.message || 'An unknown error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const renderPredictionResult = () => {
    if (loading) {
      return <p className="text-blue-500 flex items-center"><Clock className="w-4 h-4 mr-2 animate-spin" /> {t('staffing.loading')}</p>;
    }

    if (error) {
      return (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="flex items-center font-semibold"><AlertCircle className="w-5 h-5 mr-2" /> {t('staffing.errorTriggeringPrediction')}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }

    if (prediction) {
      return (
        <div className="space-y-4">
          <p className="text-4xl font-bold text-green-600 flex items-center">
            <Users className="w-8 h-8 mr-3" />
            {prediction.predicted_staff} {t('staffing.staffNeeded')}
          </p>
          <p className="text-sm text-gray-600">
            {t('staffing.confidenceLevel')}: {prediction.confidence_level}%
          </p>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-700">{t('staffing.optimizationInsight')}</p>
            <p className="text-xs text-green-600">{prediction.optimization_insight}</p>
          </div>
        </div>
      );
    }

    return <p className="text-gray-500">{t('staffing.runPredictionPrompt')}</p>;
  };

  return (
    <div className="p-6 space-y-6">
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
            <p className="text-xs text-gray-500">{t('staffing.shiftTime')}</p>
          </CardContent>
        </Card>

        {/* Predicted Staff Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('staffing.predictedStaffNeeded')}</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="min-h-[100px] flex items-center">
                {renderPredictionResult()}
              </div>
              <Button
                onClick={runPrediction}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? t('staffing.running') : t('staffing.runPredictionNow')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staffing.optimizationInsights')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {t('staffing.optimizationDescription')}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p className="font-medium text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {t('staffing.highRiskResidents')}: 5</p>
            <p className="font-medium text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> {t('staffing.lowRiskResidents')}: 20</p>
            <p className="font-medium text-gray-600 flex items-center"><Users className="w-4 h-4 mr-2" /> {t('staffing.totalResidents')}: 25</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
