import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Temporary debug log for testing (no tokens logged)
        console.log('Auth callback - Session status:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email || 'No email',
          sessionValid: !!session?.access_token
        });
        
        if (session) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

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