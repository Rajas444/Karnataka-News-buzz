
'use client';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AIChatWidget from '@/components/shared/AIChatWidget';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import MainLayoutClient from './layout.client';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Newspaper className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Loading your experience...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // This should be handled by the layout.client, but as a safeguard
        useEffect(() => {
            router.replace('/');
        }, [router]);
        return (
             <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Newspaper className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        );
    }


  return (
    <MainLayoutClient>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <AIChatWidget />
        </div>
    </MainLayoutClient>
  );
}
