import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Care AI</CardTitle>
          <CardDescription>
            Welcome to your healthcare monitoring system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please sign in to access your dashboard and monitoring tools.
          </p>
          <Link to="/login" className="block">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
  },
});
