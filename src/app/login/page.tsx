
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Newspaper, Terminal } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
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


export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    // If a user is already logged in, the root page will handle the redirect.
    // This prevents this page from being shown to an authenticated user.
    if (!authLoading && user) {
      router.replace('/'); 
    }
  }, [user, authLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, the root page's useEffect will handle redirection.
      toast({ title: 'Login Successful', description: 'Redirecting...' });
      // No need to manually push router here.
    } catch (error: any) {
      console.error(error);
      const errorCode = error.code || '';
      if (errorCode.includes('requests-to-this-api') && errorCode.includes('signinwithpassword-are-blocked')) {
        setAuthError("Email/Password sign-in is not enabled in your Firebase project. Please enable it in the Firebase console's Authentication section.");
      } else if (error.code === 'auth/invalid-credential') {
        setAuthError("Invalid credentials. Please check your email and password.");
      } else if (error.message?.includes('client is offline') || error.code === 'unavailable') {
        setAuthError('Could not connect to the database. Please ensure Firestore is enabled and has correct rules.');
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
  
    // Show loading screen while auth state is being determined, or if user is already logged in and waiting for redirect.
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
            <CardTitle className="text-2xl font-headline">User Login</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
                <Alert variant="destructive" className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
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
                           <Input id="reset-email" type="email" placeholder="user@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
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
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
             <div className="mt-4 text-center text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="underline text-primary">
                    Register
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
