
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getExternalNews } from '@/services/newsapi';
import type { Article } from '@/lib/types';
import { Loader2, TrendingUp } from 'lucide-react';
import { useArticleModal } from '../providers/article-modal-provider';

export default function TrendingNews() {
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { onOpen } = useArticleModal();

  useEffect(() => {
    async function fetchTrending() {
      try {
        const articles = await getExternalNews({ type: 'top-headlines' });
        setTrending(articles.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch trending articles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp /> Trending News</CardTitle>
          <CardDescription>What's popular right now.</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp /> Trending News</CardTitle>
            <CardDescription>What's popular right now across the state.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
            {trending.map((article, index) => (
                <li 
                    key={article.id} 
                    className="flex items-start gap-4 group cursor-pointer"
                    onClick={() => onOpen(article.id)}
                >
                    <span className="text-2xl font-bold text-primary opacity-50 w-6 text-center">
                        {index + 1}
                    </span>
                    <div>
                        <p className="font-semibold leading-tight group-hover:underline font-kannada">
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
