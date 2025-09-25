import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { waitReject, parseErr } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/hooks/useAuthStore';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('AuthGate: Checking authentication...');
        }

        // Race condition: get session or timeout after 8 seconds
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = waitReject(8000, 'Login took too long. Please try again.');

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (!mounted) return;

        if (session) {
          if (import.meta.env.DEV) {
            console.log('AuthGate: Session found, ensuring profile...');
          }
          
          // Call ensure_profile RPC and gate until org_id is available
          const { data: profile, error: profileError } = await supabase.rpc('ensure_profile');
          
          if (profileError) {
            throw profileError;
          }

          const profileData = profile as any;
          if (!profileData?.org_id) {
            throw new Error('Profile missing organization ID');
          }

          // Update auth store with session data
          setAuth(session.user.id, session.user.email || '', profileData.org_id);
          
          navigate('/dashboard', { replace: true });
        } else {
          if (import.meta.env.DEV) {
            console.log('AuthGate: No session found, redirecting to login');
          }
          clearAuth();
          navigate('/login', { replace: true });
        }
      } catch (error) {
        if (!mounted) return;
        
        console.error('AuthGate: Authentication check failed:', error);
        clearAuth();
        toast({
          title: "Authentication Error",
          description: parseErr(error),
          variant: "destructive",
        });
        navigate('/login', { replace: true });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};