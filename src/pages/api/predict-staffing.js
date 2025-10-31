// File: comfort-sentinel/src/pages/api/predict-staffing.js

// এই ফাইলটি Next.js/Vite-এর API Route হিসেবে কাজ করবে।
// এটি Supabase থেকে ইনপুট ডেটা নেবে এবং একটি সরলীকৃত ML লজিক ব্যবহার করে স্টাফিং প্রেডিকশন করবে।

// নোট: যেহেতু আমরা Python ML সার্ভার ডিপ্লয় করছি না, তাই এখানে ML লজিকটি সরাসরি JavaScript-এ সিমুলেট করা হয়েছে।

// সরলীকৃত ML লজিক:
// প্রেডিকশন = (উচ্চ-ঝুঁকির বাসিন্দা * 0.5) + (খোলা সতর্কতা * 0.3) + (মোট বাসিন্দা * 0.1) + বেসলাইন
const BASELINE_STAFF = 3; // প্রতি শিফটে ন্যূনতম ৩ জন স্টাফ প্রয়োজন

const predictStaffing = (highRiskResidents, openAlerts, totalResidents) => {
  // ইনপুট ভ্যালিডেশন
  if (highRiskResidents < 0 || openAlerts < 0 || totalResidents <= 0) {
    return BASELINE_STAFF; // ভুল ডেটার জন্য বেসলাইন রিটার্ন
  }

  // বিভিন্ন ইনপুট ফিচারের গুরুত্ব:
  const highRiskWeight = 0.5;
  const openAlertsWeight = 0.3;
  const totalResidentsWeight = 0.1;

  let predictedStaff = BASELINE_STAFF;

  // উচ্চ-ঝুঁকির বাসিন্দাদের জন্য অতিরিক্ত স্টাফ
  predictedStaff += highRiskResidents * highRiskWeight;

  // খোলা সতর্কতার জন্য অতিরিক্ত স্টাফ
  predictedStaff += openAlerts * openAlertsWeight;

  // মোট বাসিন্দাদের জন্য বেসলাইন স্টাফিং
  predictedStaff += totalResidents * totalResidentsWeight;

  // স্টাফের সংখ্যা সবসময় পূর্ণ সংখ্যায় এবং রাউন্ড আপ করা হবে (কারণ স্টাফের ভগ্নাংশ হয় না)
  return Math.ceil(predictedStaff);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Supabase থেকে আসা ডেটা (যা আমরা Supabase ফাংশনে ব্যবহার করব)
    const { highRiskResidents, openAlerts, totalResidents } = req.body;

    if (highRiskResidents === undefined || openAlerts === undefined || totalResidents === undefined) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const predictedStaff = predictStaffing(
      highRiskResidents,
      openAlerts,
      totalResidents
    );

    // প্রেডিকশন সফল হলে JSON রেসপন্স
    return res.status(200).json({
      predictedStaff: predictedStaff,
      inputFeatures: {
        highRiskResidents,
        openAlerts,
        totalResidents,
      },
      message: 'Staffing prediction successful',
    });

  } catch (error) {
    console.error('Staffing Prediction Error:', error);
    return res.status(500).json({ message: 'Internal Server Error during prediction' });
  }
}
