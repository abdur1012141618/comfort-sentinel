import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  otp: z.string().trim().length(6, { message: "OTP must be 6 digits" }).regex(/^\d+$/, { message: "OTP must contain only numbers" }).optional()
});

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showOtpField, setShowOtpField] = useState(false);

  const onSubmitMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    // Validate email
    const validation = loginSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the magic link or 6-digit OTP code.');
        setShowOtpField(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email and OTP
    const validation = loginSchema.safeParse({ email, otp: otpCode });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email first');
      return;
    }

    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email'
      });
      
      if (error) {
        setError(error.message);
      } else {
        // Success - redirect to auth callback to handle session setup
        window.location.href = '/auth/callback';
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a magic link or OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmitMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || otpLoading}
                maxLength={255}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || otpLoading}
            >
              {loading ? 'Sending…' : 'Send Magic Link & OTP'}
            </Button>
          </form>

          {showOtpField && (
            <>
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              <form onSubmit={onSubmitOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-Digit OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      if (value.length <= 6) {
                        setOtpCode(value);
                      }
                    }}
                    disabled={loading || otpLoading}
                    maxLength={6}
                    pattern="\d{6}"
                    className="text-center text-lg tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || otpLoading || otpCode.length !== 6}
                >
                  {otpLoading ? 'Verifying…' : 'Verify OTP'}
                </Button>
              </form>
            </>
          )}

          {error && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-center text-destructive">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-center text-green-700">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}