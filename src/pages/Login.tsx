import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    try {
      // If we're in preview (*.lovableproject.com) redirect to published domain.
      const host = window.location.host;
      const isPreview = host.endsWith(".lovableproject.com");
      const publishedBase = "https://comfort-sentinel.lovable.app";
      const base = isPreview ? publishedBase : window.location.origin;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${base}/dashboard` },
      });

      setMsg(error ? error.message : "Check your email for the magic link.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={sending}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={sending}
            >
              {sending ? 'Sending…' : 'Send Magic Link'}
            </Button>
          </form>
          {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;