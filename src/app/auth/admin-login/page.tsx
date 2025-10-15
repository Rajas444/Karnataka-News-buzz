
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Newspaper, ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
        router.replace('/');
    }
  }, [user, userRole, authLoading, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful', description: 'Redirecting...' });
      router.replace('/');
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorCode = error.code || '';
      if (errorCode.includes('requests-to-this-api') && errorCode.includes('signinwithpassword-are-blocked')) {
        setAuthError("Email/Password sign-in is not enabled for this Firebase project. Please enable it in the Firebase Console under Authentication > Sign-in method.");
      } else if (error.code === 'auth/invalid-credential') {
        setAuthError('Invalid credentials. Please ensure you are using an admin account.');
      } else {
        setAuthError(error.message || 'An unknown error occurred.');
      }
       setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for a link to reset your password." });
    } catch (error: any) {
      toast({ title: "Error", description: "Could not send password reset email. Please check the email address.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  
    if (authLoading || user) {
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
            {authError && (
                <Alert variant="destructive" className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                </Alert>
            )}
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
                 <div className="flex items-center justify-between">
                    <Label htmlFor="password">Admin Password</Label>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button type="button" className="text-sm text-primary hover:underline">Forgot password?</button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Password</AlertDialogTitle>
                          <AlertDialogDescription>
                            Enter your email address and we will send you a link to reset your password.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                           <Label htmlFor="reset-email">Email Address</Label>
                           <Input id="reset-email" type="email" placeholder="admin@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePasswordReset}>Send Reset Link</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
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
