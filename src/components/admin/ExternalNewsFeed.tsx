
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getExternalNews } from '@/services/newsapi';
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
        const fetchedNews = await getExternalNews();
        if (fetchedNews.length === 0) {
          setError("Could not load the live news feed. The API may be misconfigured or returning no articles.");
        }
        setNews(fetchedNews.slice(0, 5)); // Show top 5
      } catch (e: any) {
        console.error('Failed to fetch external news:', e);
        setError(e.message || "An unknown error occurred while fetching news.");
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
          <CardTitle className="flex items-center gap-2"><Newspaper /> Live News Feed</CardTitle>
          <CardDescription>Top headlines from around the web.</CardDescription>
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
                <CardTitle className="flex items-center gap-2"><Newspaper /> Live News Feed</CardTitle>
                <CardDescription>Top headlines from around the web.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">{error || "Could not load live news feed. Please ensure the NewsAPI key is correctly configured."}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Newspaper /> Live News Feed</CardTitle>
            <CardDescription>Top headlines from around the web.</CardDescription>
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
                         <p className="text-xs text-muted-foreground">{article.source}</p>
                    </div>
                </li>
            ))}
            </ul>
        </CardContent>
    </Card>
  );
}
