
'use client';

import { useState, useEffect, useCallback } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getArticles } from '@/services/articles';
import { Button } from '../ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, startAfter, limit, Timestamp } from 'firebase/firestore';
import { getDistricts } from '@/services/districts';
import { useTranslation } from '@/hooks/use-translation';

interface ArticleListProps {
  initialArticles: Article[];
  categorySlug?: string;
  districtId?: string;
  allCategories?: Category[];
}

export default function ArticleList({ initialArticles, categorySlug, districtId, allCategories = [] }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisibleDocId, setLastVisibleDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

   useEffect(() => {
    setArticles(initialArticles);
    if (initialArticles.length > 0) {
      setLastVisibleDocId(initialArticles[initialArticles.length - 1].id);
    }
    setHasMore(initialArticles.length >= 10);
  }, [initialArticles]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    let q = query(
      collection(db, "news_articles"),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(1)
    );

    if (districtId && districtId !== 'all') {
      q = query(
        collection(db, "news_articles"),
        where('districtId', '==', districtId),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(1)
      );
    }
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.docs.length > 0) {
            const latestDoc = snapshot.docs[0];
            const districts = await getDistricts();
            const data = latestDoc.data();
            const district = districts.find(d => d.id === data.districtId)?.name;

             const newArticle: Article = {
                ...data,
                id: latestDoc.id,
                publishedAt: (data.publishedAt as Timestamp)?.toDate().toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
                district: district || undefined,
            } as Article;

            // Add the new article to the top of the list if it's not already there
            setArticles(prevArticles => {
                if (!prevArticles.some(a => a.id === newArticle.id)) {
                    return [newArticle, ...prevArticles];
                }
                return prevArticles;
            });
        }
    }, (error) => {
        console.error("Real-time update failed:", error);
        toast({
          title: t('article_list.error_live_updates_title'),
          description: t('article_list.error_live_updates_description'),
          variant: 'destructive'
        })
    });

    return () => unsubscribe();
  }, [districtId, toast, t]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { articles: newArticles, lastVisibleDocId: newLastVisibleDocId } = await getArticles({
        pageSize: 10,
        startAfterDocId: lastVisibleDocId,
        categorySlug,
        districtId,
      });
      
      if (newArticles.length > 0) {
        setArticles(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNewArticles];
        });
        setLastVisibleDocId(newLastVisibleDocId);
        setHasMore(newLastVisibleDocId !== null);
      } else {
        setHasMore(false);
      }

    } catch (error: any) {
      console.error("Failed to load more articles", error);
      toast({ title: t('article_list.error_load_more'), variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisibleDocId, toast, categorySlug, districtId, t]);
  
  if (articles.length === 0 && !loadingMore) {
    return (
      <div className="text-center py-12 bg-card rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{t('article_list.no_articles_title')}</h2>
        <p className="text-muted-foreground">
          {t('article_list.no_articles_description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loadingMore ? t('article_list.loading_more') : t('article_list.load_more_button')}
          </Button>
        </div>
      )}
    </div>
  );
}
