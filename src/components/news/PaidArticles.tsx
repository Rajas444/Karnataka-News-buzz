
'use client';

import { useState, useEffect } from 'react';
import { getArticles } from '@/services/articles';
import type { Article } from '@/lib/types';
import { Loader2, Star } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

const PaidArticleCard = ({ article }: { article: Article }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 rounded-lg opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center">
         <Badge className="text-lg bg-primary/80 border-2 border-yellow-300 text-primary-foreground shadow-lg">
            <Star className="mr-2 h-5 w-5" /> PAID
        </Badge>
      </div>
      <ArticleCard article={article} />
    </div>
  );
};


export default function PaidArticles() {
  const [paidArticles, setPaidArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaidArticles() {
      try {
        const { articles } = await getArticles({ pageSize: 4 });
        // In a real app, you would filter for articles marked as "paid".
        // For this demo, we'll just take a few recent ones.
        setPaidArticles(articles);
      } catch (error) {
        console.error('Failed to fetch paid articles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPaidArticles();
  }, []);

  if (loading) {
    return (
        <Card className="p-6">
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </Card>
    );
  }

  if (paidArticles.length === 0) {
    return null;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">
                ONLY AVAILABLE IN PAID PLANS
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {paidArticles.map((article) => (
            <PaidArticleCard key={article.id} article={article} />
        ))}
        </div>
    </div>
  );
}
