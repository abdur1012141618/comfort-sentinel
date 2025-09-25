import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  org_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const upsertProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })
        .select('id')
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Profile upsert error:', error);
        }
        // Non-blocking - don't show error toast, just return null
        return null;
      }

      if (import.meta.env.DEV) {
        console.log('Profile upserted successfully for user:', userId);
      }
      
      setProfile(data as Profile);
      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Profile upsert exception:', error);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Profile fetch exception:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  return {
    profile,
    loading,
    upsertProfile,
    fetchProfile
  };
};