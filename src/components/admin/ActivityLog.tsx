import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const activities = [
    { user: 'Admin User', action: 'published', article: 'New Metro Line...', time: '5 minutes ago', avatar: '/avatars/01.png' },
    { user: 'Editor User', action: 'edited', article: 'Mysuru Dasara...', time: '1 hour ago', avatar: '/avatars/02.png' },
    { user: 'Admin User', action: 'created', article: 'RCB Unveil New Jersey', time: '3 hours ago', avatar: '/avatars/01.png' },
    { user: 'Admin User', action: 'deleted', article: 'Old Event Coverage', time: '1 day ago', avatar: '/avatars/01.png' },
    { user: 'Editor User', action: 'scheduled', article: 'Tech Conference 2024', time: '2 days ago', avatar: '/avatars/02.png' },
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
                        <AvatarImage src={activity.avatar} alt="Avatar" />
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
