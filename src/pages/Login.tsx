// src/pages/Login.tsx (আপনার আসল কোড)
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
// src/pages/Login.tsx-এ সঠিক লাইন
import { supabase } from '../integrations/supabase/supabaseClient';


export function Login() {
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
}
