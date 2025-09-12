
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postFormSchema, postCategories, type PostFormValues } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/services/posts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Loader2, MapPin, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Incident',
      location: '',
      imageUrl: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
           try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const locationName = data.address.city || data.address.town || data.address.village || 'Detected Location';
            form.setValue('location', locationName);
            toast({ title: 'Location detected!' });
          } catch (error) {
            console.error("Reverse geocoding failed", error);
            form.setValue('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            toast({ title: 'Location coordinates captured!' });
          }
        },
        (error) => {
          toast({ title: 'Could not detect location', description: error.message, variant: 'destructive' });
        }
      );
    } else {
      toast({ title: 'Geolocation is not supported by this browser.', variant: 'destructive' });
    }
  };

  const onSubmit = async (values: PostFormValues) => {
    if (!user) {
      toast({ title: 'Please login to create a post.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await createPost(values, {
        uid: user.uid,
        displayName: userProfile?.displayName || user.email,
        photoURL: userProfile?.photoURL || null,
      });
      toast({ title: 'Post created!', description: 'Your update has been shared with the community.' });
      form.reset();
      setImagePreview(null);
      router.refresh(); // Refresh server components to show the new post
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create post', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Don't show the component if user is not logged in
  }

  return (
    <Card>
      <CardHeader className="p-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={userProfile?.photoURL || undefined} />
            <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
           <CardTitle>What's on your mind, {userProfile?.displayName?.split(' ')[0] || 'User'}?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title / Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="A short, clear headline for the update" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {postCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share all the details about what's happening..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {imagePreview && (
              <div className="relative w-full max-w-xs">
                <Image src={imagePreview} alt="Preview" width={200} height={150} className="rounded-md object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setImagePreview(null);
                    form.setValue('imageUrl', null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <div className="relative">
                               <Input placeholder="e.g., Cubbon Park, Bengaluru" {...field} className="pr-10" />
                               <Button size="icon" variant="ghost" type="button" onClick={handleLocationDetect} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                   <MapPin className="h-4 w-4" />
                               </Button>
                            </div>
                        </FormControl>
                         <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormItem>
                    <FormLabel>Attach a Photo</FormLabel>
                     <FormControl>
                        <Input
                            id="image-upload-structured"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </FormControl>
                 </FormItem>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                Submit Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
