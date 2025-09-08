import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Tags, Users, Eye } from 'lucide-react';
import { placeholderArticles, placeholderCategories } from '@/lib/placeholder-data';

export default function DashboardStats() {
  const totalArticles = placeholderArticles.length;
  const totalCategories = placeholderCategories.length;
  // This value is hardcoded as we don't have a user data source.
  const totalUsers = 5832; 
  const totalViews = placeholderArticles.reduce((sum, article) => sum + article.views, 0);

  const formatViews = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const stats = [
    { title: 'Total Articles', value: totalArticles.toLocaleString(), icon: FileText, change: '+5 this month' },
    { title: 'Total Categories', value: totalCategories.toLocaleString(), icon: Tags, change: '+2 this month' },
    { title: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, change: '+150 this month' },
    { title: 'Total Views', value: formatViews(totalViews), icon: Eye, change: '+12% from last month' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
