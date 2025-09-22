

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2, ShieldAlert } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCategories } from '@/services/categories';
import { getArticles } from '@/services/articles';
import { Button } from '../ui/button';
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  limit,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ArticleListProps {
  initialArticles: Article[];
  categorySlug?: string;
  districtId?: string;
  initialLastVisibleDocId?: string | null;
}

export default function ArticleList({ initialArticles, categorySlug, districtId, initialLastVisibleDocId }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisibleDocId, setLastVisibleDocId] = useState<string | null>(initialLastVisibleDocId || null);
  const [hasMore, setHasMore] = useState(initialArticles.length > 0 && initialLastVisibleDocId !== null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const categoryId = useMemo(() => {
    if (!categorySlug || categorySlug === 'all') return null;
    return allCategories.find(c => c.slug === categorySlug)?.id;
  }, [categorySlug, allCategories]);

  useEffect(() => {
    setArticles(initialArticles);
    setHasMore(initialArticles.length > 0 && initialLastVisibleDocId !== null);
    setRealtimeError(null);
    setLastVisibleDocId(initialLastVisibleDocId || null);
    setLoading(false);

    async function fetchInitialData() {
      try {
        const fetchedCategories = await getCategories();
        setAllCategories(fetchedCategories);
      } catch (e) {
        console.error("Failed to fetch categories for ArticleList", e);
      }
    }
    fetchInitialData();
  }, [initialArticles, initialLastVisibleDocId]);


  useEffect(() => {
    if (!db) return;

    setRealtimeError(null);

    const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy("publishedAt", "desc"),
        limit(20) 
    ];
    
    // This logic ensures we only apply one filter at a time for real-time queries to avoid index errors.
    // The initial server-side load handles combined filters correctly.
    if (districtId && districtId !== 'all') {
      constraints.push(where('districtId', '==', districtId));
    } else if (categoryId) {
      constraints.push(where('categoryIds', 'array-contains', categoryId));
    }

    const q = query(collection(db, "articles"), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveArticles: Article[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            liveArticles.push({
                id: doc.id,
                ...data,
                publishedAt: data.publishedAt?.toDate().toISOString(),
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            } as Article);
        });

        setArticles(prev => {
            const allArticlesMap = new Map();
            // Add new articles first to give them priority
            liveArticles.forEach(article => allArticlesMap.set(article.id, article));
            // Then add previous articles, avoiding duplicates
            prev.forEach(article => {
                if (!allArticlesMap.has(article.id)) {
                    allArticlesMap.set(article.id, article);
                }
            });

            const finalArticles = Array.from(allArticlesMap.values());
            return finalArticles.sort((a,b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        });

        if(loading) setLoading(false);
        setRealtimeError(null);

    }, (error: any) => {
        console.error("Real-time update failed:", error);
         if (error.code === 'failed-precondition') {
            setRealtimeError("A database index is required for this filter combination. Live updates may be incomplete.");
        } else {
            setRealtimeError("Could not connect for live updates. You are viewing a static list.");
        }
        if(loading) setLoading(false);
    });

    return () => unsubscribe();
  }, [loading, categoryId, districtId]);


  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { articles: newArticles, lastVisibleDocId: newLastVisibleDocId } = await getArticles({
        pageSize: 10,
        startAfterDocId: lastVisibleDocId,
        category: categorySlug,
        district: districtId,
      });
      
      setArticles(prev => [...prev, ...newArticles]);
      setLastVisibleDocId(newLastVisibleDocId);
      setHasMore(newArticles.length > 0 && newLastVisibleDocId !== null);

    } catch (error) {
      console.error("Failed to load more articles", error);
      toast({ title: "Failed to load more news", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisibleDocId, toast, categorySlug, districtId]);
  
  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!loading && articles.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg">
        <h2 className="text-2xl font-bold mb-4 font-kannada">No Articles Found</h2>
        <p className="text-muted-foreground font-kannada">
          There are no articles available for the selected filters. Please try again later or select different filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {realtimeError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md flex items-center gap-3">
          <ShieldAlert className="h-5 w-5"/>
          <p className="text-sm font-medium">{realtimeError}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
        ))}
      </div>
      {hasMore && articles.length > 0 && (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loadingMore ? 'Loading...' : 'Load More News'}
          </Button>
        </div>
      )}
    </div>
  );
}
