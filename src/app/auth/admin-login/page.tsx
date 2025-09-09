
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

const ADMIN_EMAIL = 'rajashekar2002@gmail.com';
const ADMIN_PASS = 'Raju@4444';
const ACCESS_CODE = '4444';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log('[AdminLoginPage] Auth State:', { authLoading, user: !!user, userRole });


  useEffect(() => {
    // This effect will handle redirecting away if the user is ALREADY an admin.
    // The login handler will take care of the redirect AFTER a successful login.
    console.log('[AdminLoginPage] useEffect check:', { authLoading, user: !!user, userRole });
    if (!authLoading && user && userRole === 'admin') {
        console.log('[AdminLoginPage] Redirecting already-logged-in admin to dashboard.');
        router.replace('/admin/dashboard');
    }
  }, [user, userRole, authLoading, router]);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsCodeVerified(true);
      toast({ title: 'Access Granted', description: 'Please enter admin credentials.' });
    } else {
      toast({ title: 'Invalid Code', description: 'The access code is incorrect.', variant: 'destructive' });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASS) {
      toast({
        title: 'Login Failed',
        description: 'Invalid admin credentials.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Admin Login Successful', description: 'Redirecting to dashboard...' });
      // The useEffect should handle the redirect now once the auth state is updated.
      // Forcing a redirect here can cause a race condition.
      router.replace('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
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
            <span className="font-bold font-headline text-2xl">Karnataka News Buzz</span>
          </Link>
        </div>
        <Card>
          {!isCodeVerified ? (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <ShieldCheck /> Admin Access
                </CardTitle>
                <CardDescription>Enter the special access code to proceed to admin login.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="access-code">Access Code</Label>
                    <Input
                      id="access-code"
                      type="password"
                      placeholder="****"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Verify Code
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
                <CardDescription>Enter your administrator credentials.</CardDescription>
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
            </>
          )}
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
