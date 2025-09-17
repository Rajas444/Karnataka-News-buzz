
'use client';

import { useState, useEffect } from 'react';
import { getRelatedArticles } from '@/services/articles';
import type { Article } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useArticleModal } from './../providers/article-modal-provider';

interface RelatedArticlesProps {
  categoryId: string;
  currentArticleId: string;
}

export default function RelatedArticles({ categoryId, currentArticleId }: RelatedArticlesProps) {
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { onOpen } = useArticleModal();

  useEffect(() => {
    async function fetchRelated() {
      if (!categoryId) return;
      setLoading(true);
      try {
        const articles = await getRelatedArticles(categoryId, currentArticleId);
        setRelated(articles);
      } catch (error) {
        console.error("Failed to fetch related articles", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [categoryId, currentArticleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (related.length === 0) {
    return null; // Don't show the section if no related articles are found
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold font-headline mb-4">Related News</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map(article => (
          <div 
            key={article.id} 
            className="group cursor-pointer"
            onClick={() => onOpen(article.id)}
          >
            <p className="font-semibold text-base leading-snug group-hover:underline font-kannada">
              {article.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

    