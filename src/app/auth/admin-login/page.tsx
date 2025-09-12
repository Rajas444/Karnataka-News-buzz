
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Newspaper, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log('[AdminLoginPage] Auth State:', { authLoading, user: !!user, userRole });


  useEffect(() => {
    // This effect will handle redirecting away if the user is ALREADY an admin.
    console.log('[AdminLoginPage] useEffect check:', { authLoading, user: !!user, userRole });
    if (!authLoading && user && userRole === 'admin') {
        console.log('[AdminLoginPage] Redirecting already-logged-in admin to dashboard.');
        router.replace('/admin/dashboard');
    }
  }, [user, userRole, authLoading, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      // The useEffect should handle the redirect now once the auth state is updated.
      router.replace('/admin/dashboard');
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: 'Login Failed',
        description: error.code === 'auth/invalid-credential' 
            ? 'Invalid credentials. Please ensure you are using an admin account.'
            : (error.message || 'An unknown error occurred.'),
        variant: 'destructive',
      });
    } finally {
        setLoading(false);
    }
  };
  
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Newspaper className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <Newspaper className="h-8 w-8 text-primary" />
            <span className="font-bold font-headline text-2xl">Karnataka News Pulse</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <ShieldCheck /> Admin Login
            </CardTitle>
            <CardDescription>Enter your administrator credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login as Admin'}
              </Button>
            </form>
          </CardContent>
           <div className="p-6 pt-0 text-center text-sm">
                Not an admin?{' '}
                <Link href="/" className="underline text-primary">
                    User Login
                </Link>
            </div>
        </Card>
      </div>
    </div>
  );
}
