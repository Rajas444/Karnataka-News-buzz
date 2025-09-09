
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/app/(main)/layout';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Skeleton className="h-6 w-40 mx-auto" />
              <Skeleton className="h-4 w-56 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    // This should be handled by the layout, but as a fallback:
    return <div className="container mx-auto px-4 py-8 text-center">Please log in to view your profile.</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={userProfile?.photoURL || undefined} />
              <AvatarFallback className="text-3xl">
                {userProfile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{userProfile?.displayName || 'User'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" defaultValue={userProfile?.displayName || ''} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={user.email || ''} disabled />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={userProfile?.role || 'user'} disabled />
              </div>
              <Button>Update Profile</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
