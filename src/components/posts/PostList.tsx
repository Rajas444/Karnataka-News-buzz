
'use client';

import { useEffect, useState } from 'react';
import { getPosts } from '@/services/posts';
import type { Post } from '@/lib/types';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts", error);
        toast({ title: 'Could not load community posts.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center bg-card p-8 rounded-lg">
        <h3 className="font-semibold">No Community Updates Yet</h3>
        <p className="text-muted-foreground text-sm">Be the first one to share what's happening!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
