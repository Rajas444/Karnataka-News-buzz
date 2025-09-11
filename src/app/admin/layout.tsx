
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Newspaper, LayoutDashboard, FileText, Tags, Map, BarChart2, LogOut, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import AIChatWidget from '@/components/shared/AIChatWidget';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/districts', label: 'Districts', icon: Map },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, userRole } = useAuth();
  const router = useRouter();

  console.log('[AdminLayout] Auth State:', { loading, user: !!user, userRole });

  useEffect(() => {
    console.log('[AdminLayout] useEffect triggered. State:', { loading, user: !!user, userRole });
    if (!loading) {
      if (!user || userRole !== 'admin') {
        console.log('[AdminLayout] Redirecting to admin login. Reason: Not an admin or not logged in.');
        router.replace('/auth/admin-login');
      } else {
        console.log('[AdminLayout] Access granted. User is an admin.');
      }
    } else {
        console.log('[AdminLayout] Still loading auth state...');
    }
  }, [user, loading, userRole, router]);

  if (loading || !user || userRole !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Newspaper className="h-12 w-12 text-primary animate-pulse" />
            <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <Link href="/home" className="flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-md transition-colors">
                <Newspaper className="w-8 h-8 text-primary" />
                <div className="flex flex-col">
                <span className="text-lg font-headline font-semibold">KNB Admin</span>
                </div>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton tooltip={{ children: item.label }}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
             <Avatar>
                <AvatarImage src={userProfile?.photoURL} />
                <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{userProfile?.displayName || userProfile?.email}</span>
                <span className="text-xs text-muted-foreground">{userProfile?.role}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => auth.signOut()}>
                <LogOut className="w-4 h-4"/>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-muted/40">
        <div className="p-4 sm:p-6 lg:p-8">
            {children}
        </div>
        <AIChatWidget />
      </SidebarInset>
    </SidebarProvider>
  );
}
