
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Tags, Users, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getArticles } from '@/services/articles';
import { getCategories } from '@/services/categories';
import { getUsers } from '@/services/users';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [articlesResult, categories, users] = await Promise.all([
          getArticles({ pageSize: 1000 }), // Fetch all to get a count
          getCategories(),
          getUsers(),
        ]);
        
        const totalViews = articlesResult.articles.reduce((sum, article) => sum + (article.views || 0), 0);

        setStats({
          totalArticles: articlesResult.articles.length,
          totalCategories: categories.length,
          totalUsers: users.length,
          totalViews: totalViews,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Keep stats at 0 if fetching fails
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatViews = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const statItems = [
    { title: 'Total Articles', value: stats.totalArticles.toLocaleString(), icon: FileText, change: '+5 this month' },
    { title: 'Total Categories', value: stats.totalCategories.toLocaleString(), icon: Tags, change: '+2 this month' },
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, change: '+150 this month' },
    { title: 'Total Views', value: formatViews(stats.totalViews), icon: Eye, change: '+12% from last month' },
  ];

  if (loading) {
      return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-4 w-2/3" />
                      </CardHeader>
                      <CardContent>
                          <Skeleton className="h-7 w-1/3" />
                           <Skeleton className="h-3 w-1/2 mt-2" />
                      </CardContent>
                  </Card>
              ))}
          </div>
      );
  }


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
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
