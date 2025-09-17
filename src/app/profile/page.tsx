
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/app/(main)/layout';
import { useState, useEffect } from 'react';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/services/users';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setImagePreview(userProfile.photoURL || null);
    }
  }, [userProfile]);

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
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        await updateUserProfile(user.uid, {
            displayName,
            phoneNumber,
            newImage: imageFile
        });
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        });
        // Force a reload of the auth state by refreshing the page
        router.refresh();

    } catch (error) {
        console.error("Failed to update profile", error);
        toast({
            title: "Update Failed",
            description: "Could not update your profile.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>
        <Card>
          <CardHeader className="items-center text-center">
             <div className="relative w-24 h-24 mb-4">
                <Avatar className="w-24 h-24">
                <AvatarImage src={imagePreview || undefined} />
                <AvatarFallback className="text-3xl">
                    {displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
                </Avatar>
                 <Input id="photoURL" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                 <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background" asChild>
                    <Label htmlFor="photoURL" className="cursor-pointer">
                        <Upload className="h-4 w-4"/>
                        <span className="sr-only">Upload picture</span>
                    </Label>
                 </Button>
            </div>
            <CardTitle>{displayName || 'User'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={displayName || ''} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Mobile Number</Label>
                  <Input id="phoneNumber" type="tel" value={phoneNumber || ''} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Add your mobile number" />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={userProfile?.role || 'user'} disabled />
              </div>
              <Button onClick={handleUpdateProfile} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isSubmitting ? "Updating..." : "Update Profile"}
              </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
