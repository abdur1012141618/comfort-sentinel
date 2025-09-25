import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didComplete = false;
    
    const handleAuthCallback = async () => {
      try {
        // 1) Check for auth errors from provider
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

        // 2) Check for existing session
        let { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // 3) Try to set session from hash (implicit flow)
        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ 
            access_token: accessToken, 
            refresh_token: refreshToken 
          });
          
          if (!error) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // 4) Fallback - redirect to login
        toast({
          title: "Login Timeout",
          description: "Login timed out. Please try again.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
        
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "An error occurred during authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    // Start the auth callback process immediately
    const timer = setTimeout(() => {
      if (!didComplete) {
        handleAuthCallback();
      }
    }, 0);

    // Safety timeout after 8 seconds
    const safetyTimer = setTimeout(() => {
      if (!didComplete) {
        didComplete = true;
        toast({
          title: "Login Timeout",
          description: "Login timed out. Please try again.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
        setLoading(false);
      }
    }, 8000);

    return () => {
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