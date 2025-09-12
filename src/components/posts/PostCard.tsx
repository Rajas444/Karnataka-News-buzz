
import type { Post } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Badge } from '../ui/badge';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={post.authorPhotoURL || undefined} />
                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{post.authorName}</p>
                <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
            </div>
            </div>
             <Badge variant="secondary" className="flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                {post.category}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-xl font-bold font-kannada">{post.title}</CardTitle>
        <p className="text-base font-kannada">{post.description}</p>
        {post.imageUrl && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden mt-4">
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
          </div>
        )}
      </CardContent>
      {post.location && (
        <CardFooter>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{post.location}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
