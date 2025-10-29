import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient'; // Adjust path as needed
import { Card, Grid, Typography, CircularProgress, Alert, Button } from '@mui/material'; // Assuming MUI or similar component library

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
        const { data, error } = await supabase.rpc('predict_staff_needed', { current_shift: currentShift });

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
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        {t('staffing.title')}
      </Typography>
      
      <Alert severity="info" style={{ marginBottom: 20 }}>
        {t('staffing.currentShiftInfo', { shift: currentShift })}
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card style={{ padding: 20, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('staffing.staffNeeded')}
            </Typography>
            {loading ? (
              <CircularProgress size={60} style={{ margin: 20 }} />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : prediction ? (
              <>
                <Typography variant="h1" color="primary">
                  {prediction.predicted_staff_needed}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('staffing.predictionTime', { time: new Date(prediction.created_at).toLocaleTimeString() })}
                </Typography>
              </>
            ) : (
              <Typography variant="h5" color="textSecondary">
                {t('staffing.noPrediction')}
              </Typography>
            )}
            
            <Button 
                variant="contained" 
                color="primary" 
                onClick={triggerPrediction} 
                disabled={loading}
                style={{ marginTop: 20 }}
            >
                {t('staffing.runPrediction')}
            </Button>
          </Card>
        </Grid>

        {/* Displaying Input Features for Transparency */}
        <Grid item xs={12} md={6}>
            <Card style={{ padding: 20 }}>
                <Typography variant="h6" gutterBottom>
                    {t('staffing.inputFeatures')}
                </Typography>
                {prediction && (
                    <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="body1">{t('staffing.totalResidents')}:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1" align="right"><strong>{prediction.total_residents}</strong></Typography></Grid>
                        
                        <Grid item xs={6}><Typography variant="body1">{t('staffing.highRiskResidents')}:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1" align="right"><strong>{prediction.total_high_risk}</strong></Typography></Grid>
                        
                        <Grid item xs={6}><Typography variant="body1">{t('staffing.openAlerts')}:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1" align="right"><strong>{prediction.total_alerts}</strong></Typography></Grid>
                        
                        <Grid item xs={6}><Typography variant="body1">{t('staffing.incidentCount')}:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body1" align="right"><strong>{prediction.incident_count || 0}</strong></Typography></Grid>
                    </Grid>
                )}
                {!prediction && !loading && !error && (
                    <Typography variant="body2" color="textSecondary">
                        {t('staffing.runToSeeFeatures')}
                    </Typography>
                )}
            </Card>
        </Grid>
      </Grid>
      
      {/* Additional section for historical log or optimization tips */}
      <Card style={{ padding: 20, marginTop: 20 }}>
        <Typography variant="h6" gutterBottom>
            {t('staffing.optimizationTips')}
        </Typography>
        <Typography variant="body1">
            {t('staffing.tip1')}
        </Typography>
        <Typography variant="body1">
            {t('staffing.tip2')}
        </Typography>
      </Card>
    </div>
  );
};

export default StaffingDashboard;
