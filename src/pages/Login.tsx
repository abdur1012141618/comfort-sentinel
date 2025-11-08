// src/pages/Login.tsx (অস্থায়ী ফিক্স)
import React from 'react';
// import { Auth } from '@supabase/auth-ui-react'; // আপনার আসল ইম্পোর্ট
// import { ThemeSupa } from '@supabase/auth-ui-shared'; // আপনার আসল ইম্পোর্ট
// import { supabase } from '../supabaseClient'; // আপনার আসল ইম্পোর্ট

export function Login() {
  // আপনার আসল কোডটি কমেন্ট করা হলো:
  /*
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Sign in to Comfort Sentinel
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          redirectTo={window.location.origin}
          socialLayout="horizontal"
        />
      </div>
    </div>
  );
  */

  // অস্থায়ী কোড: নিশ্চিত করার জন্য যে রুটটি কাজ করছে
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: '#FF4500', // OrangeRed
      color: 'white', 
      fontSize: '24px',
      textAlign: 'center',
      minHeight: '100vh'
    }}>
      <h1>LOGIN ROUTE IS WORKING!</h1>
      <p>If you see this, the routing is fixed. We will restore the original code next.</p>
    </div>
  );
}
