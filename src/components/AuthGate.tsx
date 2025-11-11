// src/components/AuthGate.tsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client.ts'; // নিশ্চিত করুন এই পাথটি সঠিক

// 1. Context তৈরি
const AuthContext = createContext<any>(null);

// 2. AuthProvider কম্পোনেন্ট তৈরি (Named Export)
export const AuthProvider: React.FC = ({ children }) => { // <-- এখানে `export` যোগ করা হয়েছে
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.session;
    setUser(session?.user ?? null);
    setLoading(false);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: (options: any) => supabase.auth.signIn(options),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. useAuth হুক তৈরি
export const useAuth = () => {
  return useContext(AuthContext);
};

// export default AuthProvider; // <-- এই লাইনটি মুছে দেওয়া হয়েছে
