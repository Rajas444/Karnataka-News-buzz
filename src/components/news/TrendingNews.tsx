
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getArticles } from '@/services/articles';
import type { Article } from '@/lib/types';
import { Loader2, TrendingUp } from 'lucide-react';
import { useArticleModal } from '../providers/article-modal-provider';

export default function TrendingNews() {
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onOpen } = useArticleModal();

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Fetch top 5 most viewed articles from Firestore
        const { articles } = await getArticles({ pageSize: 5 }); // This will be sorted by publishedAt
        
        // To properly get "trending", we should ideally sort by views.
        // For now, we'll simulate this by taking the latest and assuming they have views.
        // A proper implementation would require a query sorted by 'views'.
        const sortedByViews = articles.sort((a, b) => (b.views || 0) - (a.views || 0));

        if (sortedByViews.length === 0) {
          setError("Could not load trending news at this time.");
        }
        setTrending(sortedByViews.slice(0, 5));
      } catch (err: any) {
        console.error('Failed to fetch trending articles:', err);
        setError("Failed to fetch trending articles. Please check database connection.");
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
          <CardTitle className="flex items-center gap-2"><TrendingUp /> ಟ್ರೆಂಡಿಂಗ್ ನ್ಯೂಸ್</CardTitle>
          <CardDescription>ರಾಜ್ಯಾದ್ಯಂತ ಈಗ ಜನಪ್ರಿಯವಾಗಿರುವುದೇನು.</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || trending.length === 0) {
    return (
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp /> ಟ್ರೆಂಡಿಂಗ್ ನ್ಯೂಸ್</CardTitle>
            <CardDescription>ರಾಜ್ಯಾದ್ಯಂತ ಈಗ ಜನಪ್ರಿಯವಾಗಿರುವುದೇನು.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-sm">{error || "Could not load trending news feed."}</p>
        </CardContent>
    </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp /> ಟ್ರೆಂಡಿಂಗ್ ನ್ಯೂಸ್</CardTitle>
            <CardDescription>ರಾಜ್ಯಾದ್ಯಂತ ಈಗ ಜನಪ್ರಿಯವಾಗಿರುವುದೇನು.</CardDescription>
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
                        <p className="font-semibold leading-tight group-hover:underline">
                            {article.title}
                        </p>
                         <p className="text-xs text-muted-foreground">{article.source || article.author}</p>
                    </div>
                </li>
            ))}
            </ul>
        </CardContent>
    </Card>
  );
}
