
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreatePost from '@/components/posts/CreatePost';
import PostList from '@/components/posts/PostList';
import { MessageSquare } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight font-headline">Community Updates</h1>
            <p className="text-muted-foreground">See what's happening on the ground, reported by people like you.</p>
        </div>
        <div className="grid grid-cols-1 gap-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare />
                        Share an Update
                    </CardTitle>
                    <CardDescription>
                        Witnessed an event? Have a local story? Share it with the community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreatePost />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Community Feed</CardTitle>
                    <CardDescription>
                        Latest posts from the community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PostList />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
