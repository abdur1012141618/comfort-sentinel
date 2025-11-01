// api/predict-staff.js
import { createClient } from '@supabase/supabase-js';

// Supabase ক্লায়েন্ট তৈরি করুন
// পরিবেশ ভেরিয়েবল (Environment Variables) ব্যবহার করুন, যা Vercel-এ সেট করা আছে
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key ব্যবহার করুন

// Service Role Key ব্যবহার করে অ্যাডমিন ক্লায়েন্ট তৈরি করুন
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// একটি সাধারণ AI মডেলের অনুকরণ
const simpleAIModel = (data) => {
  const { total_residents, high_risk_residents, open_alerts } = data;

  // একটি সরল লজিক: মোট বাসিন্দার 10% + উচ্চ ঝুঁকিপূর্ণ বাসিন্দার 20% + খোলা সতর্কতার 50%
  let predictedStaff = Math.ceil(
    total_residents * 0.1 +
    high_risk_residents * 0.2 +
    open_alerts * 0.5
  );

  // সর্বনিম্ন 3 জন স্টাফ প্রয়োজন
  if (predictedStaff < 3) {
    predictedStaff = 3;
  }

  return predictedStaff;
};

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { shift_type, total_residents, high_risk_residents, open_alerts } = req.body;

    if (!shift_type || total_residents === undefined || high_risk_residents === undefined || open_alerts === undefined) {
      return res.status(400).json({ error: 'Missing required fields in request body' });
    }

    // ১. AI মডেল থেকে পূর্বাভাস নিন
    const predicted_staff = simpleAIModel(req.body);

    // ২. পূর্বাভাসটি Supabase-এর daily_staffing_log টেবিলে লগ করুন
    // Supabase ফাংশনটি ইতিমধ্যেই লগ করছে, কিন্তু এটি একটি অতিরিক্ত সুরক্ষা স্তর
    const { error: logError } = await supabaseAdmin
      .from('daily_staffing_log')
      .insert([
        {
          log_date: new Date().toISOString().split('T')[0],
          shift_type,
          total_residents,
          high_risk_residents,
          open_alerts,
          predicted_staff,
        },
      ]);

    if (logError) {
      console.error('Supabase Log Error:', logError);
      // লগিং ব্যর্থ হলেও পূর্বাভাসটি ফেরত দিন
    }

    // ৩. পূর্বাভাসটি Supabase ফাংশনে ফেরত দিন
    return res.status(200).json({
      predicted_staff,
      message: 'Prediction successful and logged.',
    });

  } catch (error) {
    console.error('Vercel API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during prediction process.' });
  }
};
