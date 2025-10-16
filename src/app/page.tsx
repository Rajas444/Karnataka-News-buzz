
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Newspaper } from 'lucide-react';

export default function RootPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
          router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router, userRole]);

  // While checking auth, show a loading state.
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Newspaper className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-muted-foreground">Loading Karnataka News Pulse...</p>
      </div>
    </div>
  );
}
