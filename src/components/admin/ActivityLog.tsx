
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

const activities = [
    { user: 'Admin User', action: 'published', article: 'New Metro Line...', time: '5 minutes ago', avatarSeed: '1' },
    { user: 'Editor User', action: 'edited', article: 'Mysuru Dasara...', time: '1 hour ago', avatarSeed: '2' },
    { user: 'Admin User', action: 'created', article: 'RCB Unveil New Jersey', time: '3 hours ago', avatarSeed: '1' },
    { user: 'Admin User', action: 'deleted', article: 'Old Event Coverage', time: '1 day ago', avatarSeed: '1' },
    { user: 'Editor User', action: 'scheduled', article: 'Tech Conference 2024', time: '2 days ago', avatarSeed: '2' },
]

export default function ActivityLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of recent administrative actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                        <Image src={`https://picsum.photos/seed/${activity.avatarSeed}/40/40`} alt="Avatar" width={40} height={40} data-ai-hint="people" />
                        <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            <span className="font-semibold text-primary">{activity.user}</span> {activity.action} the article "{activity.article}"
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
