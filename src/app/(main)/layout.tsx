
'use client';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AIChatWidget from '@/components/shared/AIChatWidget';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Newspaper } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Newspaper className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Loading your experience...</p>
                </div>
            </div>
        );
    }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
