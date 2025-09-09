
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Newspaper } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
        if (userProfile?.role === 'admin') {
            router.replace('/admin');
        } else {
            router.replace('/home');
        }
    }
  }, [user, userProfile, authLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user profile to check role
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const profile = userDoc.data();
        toast({ title: 'Login Successful', description: 'Redirecting...' });
        if (profile.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/home');
        }
      } else {
        // Default redirect for users without a profile doc or role
        toast({ title: 'Login Successful', description: 'Redirecting...' });
        router.push('/home');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/configuration-not-found') {
        toast({
            title: 'Configuration Error',
            description: "Email/Password sign-in is not enabled in your Firebase project. Please enable it in the Firebase console.",
            variant: 'destructive',
            duration: 9000,
        });
      } else if (error.code === 'auth/invalid-credential') {
        toast({
            title: 'Login Failed',
            description: "Invalid credentials. Please check your email and password.",
            variant: 'destructive',
        });
      } else if (error.message?.includes('client is offline') || error.code === 'unavailable') {
        toast({
          title: 'Firestore Error',
          description: 'Could not connect to the database. Please ensure Firestore is enabled and has correct rules.',
          variant: 'destructive',
          duration: 9000,
        });
      } else {
        toast({
            title: 'Login Failed',
            description: error.message || 'An unknown error occurred.',
            variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
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
                <span className="font-bold font-headline text-2xl">Karnataka News Buzz</span>
            </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Password</Label>
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
