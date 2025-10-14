
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
  const [error, setError] = useState<string | null>(null);
  const { onOpen } = useArticleModal();

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Fetch top headlines without a specific query to get general trending news
        const articles = await getExternalNews({ type: 'top-headlines' });
        if (articles.length === 0) {
          setError("Could not load trending news at this time.");
        }
        setTrending(articles.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch trending articles:', error);
        setError('Failed to fetch trending articles. Please check API key configuration.');
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
          <CardTitle className="flex items-center gap-2 font-kannada"><TrendingUp /> ಟ್ರೆಂಡಿಂಗ್ ನ್ಯೂಸ್</CardTitle>
          <CardDescription className="font-kannada">ಈಗ ಜನಪ್ರಿಯವಾಗಿರುವುದೇನು.</CardDescription>
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
            <CardTitle className="flex items-center gap-2 font-kannada"><TrendingUp /> ಟ್ರೆಂಡಿಂಗ್ ನ್ಯೂಸ್</CardTitle>
            <CardDescription className="font-kannada">ರಾಜ್ಯಾದ್ಯಂತ ಈಗ ಜನಪ್ರಿಯವಾಗಿರುವುದೇನು.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-sm">Could not load trending news feed.</p>
        </CardContent>
    </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-kannada"><TrendingUp /> ಟ್ರೆಂಡಿಂಗ್ ನ್ಯೂಸ್</CardTitle>
            <CardDescription className="font-kannada">ರಾಜ್ಯಾದ್ಯಂತ ಈಗ ಜನಪ್ರಿಯವಾಗಿರುವುದೇನು.</CardDescription>
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
