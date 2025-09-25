import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { waitReject, parseErr } from '@/lib/auth-utils';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    let didComplete = false;
    let mounted = true;
    
    const handleAuthCallback = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('AuthCallback: Starting auth callback handling...');
        }

        // Check for auth errors from provider
        const hash = window.location.hash || '';
        const errorDescription = new URLSearchParams(hash.slice(1)).get('error_description');
        if (errorDescription) {
          toast({
            title: "Authentication Error",
            description: decodeURIComponent(errorDescription),
            variant: "destructive",
          });
          navigate('/login', { replace: true });
          return;
        }

        // Race condition: handle auth within 8 seconds
        const authPromise = (async () => {
          // Check for existing session
          let { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            // Try to set session from hash (implicit flow)
            const params = new URLSearchParams(hash.slice(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({ 
                access_token: accessToken, 
                refresh_token: refreshToken 
              });
              
              if (!error) {
                const { data: { session: newSession } } = await supabase.auth.getSession();
                session = newSession;
              }
            }
          }

          return session;
        })();

        const timeoutPromise = waitReject(8000, 'Authentication timeout');
        const session = await Promise.race([authPromise, timeoutPromise]);

        if (!mounted || didComplete) return;

        if (session) {
          if (import.meta.env.DEV) {
            console.log('AuthCallback: Session established, ensuring profile...');
          }
          
          // Call ensure_profile RPC to get/create profile with org_id
          const { data: profile, error: profileError } = await supabase.rpc('ensure_profile');
          
          if (profileError) {
            throw profileError;
          }

          const profileData = profile as any;
          if (!profileData?.org_id) {
            throw new Error('Profile missing organization ID');
          }

          // Update auth store with session data
          const sessionData = session as any;
          setAuth(sessionData.user.id, sessionData.user.email || '', profileData.org_id);
          
          if (import.meta.env.DEV) {
            console.log('AuthCallback: Redirecting to dashboard');
          }
          
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('No session found after authentication');
        }
        
      } catch (error) {
        if (!mounted || didComplete) return;
        
        console.error('AuthCallback: Authentication failed:', error);
        clearAuth();
        toast({
          title: "Authentication Error",
          description: parseErr(error),
          variant: "destructive",
        });
        navigate('/login', { replace: true });
      } finally {
        if (mounted && !didComplete) {
          setLoading(false);
        }
      }
    };

    // Start the auth callback process immediately
    const timer = setTimeout(() => {
      if (!didComplete && mounted) {
        handleAuthCallback();
      }
    }, 0);

    // Safety timeout
    const safetyTimer = setTimeout(() => {
      if (!didComplete && mounted) {
        didComplete = true;
        toast({
          title: "Login Timeout",
          description: "Authentication took too long. Please try again.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
        setLoading(false);
      }
    }, 8500);

    return () => {
      mounted = false;
      didComplete = true;
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  return null;
}