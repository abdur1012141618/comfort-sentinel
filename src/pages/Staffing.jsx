import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../supabaseClient.ts';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, Users, Zap } from 'lucide-react';

const Staffing = () => {
    const { t } = useTranslation();
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCurrentShift = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 14) return 'Day';
        if (hour >= 14 && hour < 22) return 'Evening';
        return 'Night';
    };

    const currentShift = getCurrentShift();

    const runPrediction = async () => {
        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const { data, error } = await supabase.rpc('predict_staff_needed', { shift_type: currentShift });

            if (error) {
                console.error('Supabase RPC Error:', error);
                setError(`Error triggering prediction: ${error.message}`);
                setPrediction(null);
            } else {
                setPrediction(data);
            }
        } catch (err) {
            console.error('Prediction Catch Error:', err);
            setError(`An unexpected error occurred: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // **গুরুত্বপূর্ণ পরিবর্তন:** error ডিসপ্লে লজিকটি শুধুমাত্র তখনই error দেখাবে যখন error স্টেট সেট হবে।
    // useEffect ব্লকটি আগের মতোই সরিয়ে দেওয়া হয়েছে।

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">{t('Predictive Staffing Dashboard')}</h1>

            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg flex items-center">
                <Clock className="w-5 h-5 mr-3" />
                <p className="text-sm">
                    <span className="font-semibold">{t('staffing.currentShift')}</span>: {t(`shift.${currentShift}`)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Predicted Staff Needed */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">{t('Predicted Staff Needed for Current Shift')}</h2>
                    
                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">{t('staffing.loadingPrediction')}</p>
                        </div>
                    )}

                    {/* **পরিবর্তিত অংশ:** error && !loading কন্ডিশন যোগ করা হয়েছে */}
                    {error && !loading && (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                            <p className="font-semibold">{t('Error')}</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {prediction && (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <p className="text-5xl font-extrabold text-blue-600">{prediction.predicted_staff}</p>
                            <p className="text-lg text-gray-600 mt-2">{t('staffing.staffMembersRecommended')}</p>
                        </div>
                    )}

                    {/* **নতুন কন্ডিশন:** যদি error থাকে এবং prediction না থাকে, তবে একটি ফলব্যাক মেসেজ দেখাবে */}
                    {!loading && !prediction && !error && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">{t('staffing.noPredictionYet') || 'Click the button to run the first prediction.'}</p>
                        </div>
                    )}

                    <button
                        onClick={runPrediction}
                        disabled={loading}
                        className={`w-full py-3 mt-4 rounded-lg font-bold transition duration-200 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {loading ? t('staffing.runningPrediction') : t('Run Staffing Prediction Now')}
                    </button>
                </div>

                {/* Prediction Input Features */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">{t('Prediction Input Features')}</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 text-green-600 mr-3" />
                                <span className="font-medium">{t('Total Residents')}</span>
                            </div>
                            <span className="text-lg font-bold">{prediction?.total_residents || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                                <span className="font-medium">{t('High-Risk Residents')}</span>
                            </div>
                            <span className="text-lg font-bold">{prediction?.high_risk_residents || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <Zap className="w-5 h-5 text-yellow-600 mr-3" />
                                <span className="font-medium">{t('Open Alerts')}</span>
                            </div>
                            <span className="text-lg font-bold">{prediction?.open_alerts || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimization Insights */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">{t('Optimization Insights')}</h2>
                <p className="text-gray-600">
                    {t('staffing.optimizationInsight')}
                </p>
            </div>
        </div>
    );
};

export default Staffing;
