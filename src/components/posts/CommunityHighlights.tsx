
'use client';

import { useEffect, useState } from 'react';
import { getRecentPosts } from '@/services/posts';
import type { Post } from '@/lib/types';
import PostCard from './PostCard';
import { Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function CommunityHighlights() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await getRecentPosts(3); // Fetch only 3 recent posts
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch recent posts", error);
        // Don't show a toast for this, as it's a non-critical section
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Highlights</CardTitle>
          <CardDescription>Latest updates from people on the ground.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    // If no posts, don't show the section at all to keep the homepage clean.
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Highlights</CardTitle>
        <CardDescription>Latest updates from people on the ground.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-6 text-center">
            <Button asChild variant="outline">
                <Link href="/community">
                    View All Community Posts <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
