import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Magic Link Sent",
          description: "Check your email for the sign-in link!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Sending magic link...' : 'Send Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
// src/pages/login.tsx
import { useState } from "react";
import { supabase } from "@/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg(null);

    const host = window.location.host;
    const isPreview = host.endsWith(".lovableproject.com");
    // 👉 আপনার publish ডোমেইন
    const publishedBase = "https://comfort-sentinel.lovable.app";
    const base = isPreview ? publishedBase : window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${base}/dashboard` },
    });
// inside onSubmit(e) { ... }  // <- এই ফাংশনের ভেতরেই রাখবেন
const host = window.location.host;
const isPreview = host.endsWith(".lovableproject.com");

// Published ডোমেইন (আপনার প্রজেক্টের লাইভ ডোমেইন)
const publishedBase = "https://comfort-sentinel.lovable.app";

// প্রিভিউতে থাকলে published-এ রিডাইরেক্ট, না হলে বর্তমান origin
const base = isPreview ? publishedBase : window.location.origin;

const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${base}/dashboard`,
  },
});

setSending(false);
setMsg(error ? error.message : "Check your email for the magic link.");

    setSending(false);
    setMsg(error ? error.message : "Check your email for the magic link.");
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border rounded p-2"
        />
        <button type="submit" disabled={sending} className="w-full rounded bg-primary text-white p-2">
          {sending ? "Sending…" : "Send Magic Link"}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
