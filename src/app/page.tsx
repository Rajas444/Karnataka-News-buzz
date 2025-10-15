
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Newspaper } from 'lucide-react';

export default function LandingPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // This is the single source of truth for redirection after login.
        if (userRole === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/home');
        }
      } else {
        // If no user, send to the login page.
        router.replace('/login');
      }
    }
  }, [user, loading, userRole, router]);

  // Display a loading indicator while the auth check is in progress.
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Newspaper className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
