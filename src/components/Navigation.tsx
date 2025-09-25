import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/residents', label: 'Residents' },
    { path: '/falls', label: 'Fall Checks' },
    { path: '/alerts', label: 'Alerts' },
  ];

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl md:text-2xl font-bold">Care AI</h1>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "default" : "ghost"} 
                  size="sm"
                  className={isActive(item.path) ? "bg-primary text-primary-foreground" : ""}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        
        {session && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Signed in as {session.user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};