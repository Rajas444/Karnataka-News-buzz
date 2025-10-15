
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Newspaper } from 'lucide-react';
import { redirect } from 'next/navigation';


export default function LoginPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (userProfile?.role === 'admin') {
            redirect('/admin');
        } else {
            redirect('/home');
        }
      } else {
        redirect('/login');
      }
    }
  }, [user, userProfile, authLoading, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Newspaper className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
