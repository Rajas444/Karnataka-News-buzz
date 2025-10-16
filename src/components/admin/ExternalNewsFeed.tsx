
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getArticles } from '@/services/articles';
import type { Article } from '@/lib/types';
import { Loader2, Newspaper } from 'lucide-react';
import { useArticleModal } from '../providers/article-modal-provider';
import Image from 'next/image';

export default function ExternalNewsFeed() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onOpen } = useArticleModal();

  useEffect(() => {
    async function fetchNews() {
      try {
        const { articles } = await getArticles({ pageSize: 5 });
        const sortedByViews = articles.sort((a, b) => (b.views || 0) - (a.views || 0));
        
        if (sortedByViews.length === 0) {
          setError("There are no articles in your database to display here.");
        }
        setNews(sortedByViews);
      } catch (e: any) {
        console.error('Failed to fetch local articles:', e);
        setError(e.message || "An unknown error occurred while fetching articles.");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Newspaper /> Most Viewed Articles</CardTitle>
          <CardDescription>Your top articles based on view count.</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || news.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Newspaper /> Most Viewed Articles</CardTitle>
                <CardDescription>Your top articles based on view count.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">{error || "Could not load articles."}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Newspaper /> Most Viewed Articles</CardTitle>
            <CardDescription>Your top articles based on view count.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
            {news.map((article) => (
                <li 
                    key={article.id} 
                    className="flex items-start gap-4 group cursor-pointer"
                    onClick={() => onOpen(article.id)}
                >
                    {article.imageUrl && (
                         <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                            <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold leading-tight group-hover:underline">
                            {article.title}
                        </p>
                         <p className="text-xs text-muted-foreground">{article.author} &middot; {article.views || 0} views</p>
                    </div>
                </li>
            ))}
            </ul>
        </CardContent>
    </Card>
  );
}
