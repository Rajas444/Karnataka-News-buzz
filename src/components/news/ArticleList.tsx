
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
  where,
  limit,
  startAfter,
  QueryConstraint,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ArticleListProps {
  initialArticles: Article[];
  categorySlug?: string;
  districtId?: string;
  initialLastVisibleDoc?: any;
}

export default function ArticleList({ initialArticles, categorySlug, districtId, initialLastVisibleDoc }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(initialArticles.length > 0);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect synchronizes the component's state with the props from the server.
    setArticles(initialArticles);
    setHasMore(initialArticles.length > 0);
    setRealtimeError(null);
    if (initialLastVisibleDoc) {
      // Reconstruct the document reference for pagination
      const docRef = doc(db, "articles", initialLastVisibleDoc.id);
      setLastVisibleDoc(docRef);
    } else {
      setLastVisibleDoc(null);
      setHasMore(false);
    }

    async function fetchInitialData() {
      try {
        const fetchedCategories = await getCategories();
        setAllCategories(fetchedCategories);
      } catch (e) {
        console.error("Failed to fetch categories for ArticleList", e);
      }
    }
    fetchInitialData();
  }, [initialArticles, initialLastVisibleDoc]);


  useEffect(() => {
    if (!db) return;

    setLoading(true);
    setRealtimeError(null);

    // This listener fetches the most recent articles for live updates.
    // Filtering is handled by the `filteredArticles` useMemo hook.
    let q = query(
      collection(db, "articles"),
      where('status', '==', 'published'),
      orderBy("publishedAt", "desc"),
      limit(20) // Listen to the 20 most recent articles globally
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedArticles: Article[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            updatedArticles.push({
                id: doc.id,
                ...data,
                publishedAt: data.publishedAt?.toDate().toISOString(),
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            } as Article);
        });

        // Merge and de-duplicate, prioritizing real-time updates over paginated ones
        const allArticlesMap = new Map();
        [...updatedArticles, ...articles].forEach(article => {
            if (!allArticlesMap.has(article.id)) {
                allArticlesMap.set(article.id, article);
            }
        });

        const sorted = Array.from(allArticlesMap.values()).sort((a,b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        setArticles(sorted);
        setLoading(false);
        setRealtimeError(null);

    }, (error: any) => {
        if (error.code === 'failed-precondition') {
             const errorMessage = `Real-time updates are limited. Some filters may require a database index.`;
            setRealtimeError(errorMessage);
        } else {
            console.error("Real-time update failed:", error);
            setRealtimeError("Could not get live news updates.");
        }
        setLoading(false);
    });

    return () => unsubscribe();
    // Re-run this effect only if the main filters change, to re-establish the listener's base query
  }, [categorySlug, districtId]);


  const filteredArticles = useMemo(() => {
    let result = articles;
    if (categorySlug && categorySlug !== 'all') {
      const categoryId = allCategories.find(c => c.slug === categorySlug)?.id;
      if (categoryId) {
        result = result.filter(a => a.categoryIds?.includes(categoryId));
      }
    }
    if (districtId && districtId !== 'all') {
      result = result.filter(a => a.districtId === districtId);
    }
    return result;
  }, [articles, categorySlug, districtId, allCategories]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisibleDoc) return;

    setLoadingMore(true);
    try {
      const { articles: newArticles, lastVisibleDoc: newLastVisibleDoc } = await getArticles({
        pageSize: 10,
        startAfterDoc: lastVisibleDoc,
        category: categorySlug,
        district: districtId,
      });

      setArticles(prev => {
         const newArticlesMap = new Map(prev.map(a => [a.id, a]));
         newArticles.forEach(a => {
            if (!newArticlesMap.has(a.id)) {
                newArticlesMap.set(a.id, a);
            }
         });
         return Array.from(newArticlesMap.values());
      });

      setLastVisibleDoc(newLastVisibleDoc);
      setHasMore(newArticles.length > 0);
    } catch (error) {
      console.error("Failed to load more articles", error);
      toast({ title: "Failed to load more news", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisibleDoc, categorySlug, districtId, toast]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!loading && filteredArticles.length === 0) {
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
        {filteredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} allCategories={allCategories} />
        ))}
      </div>
      {hasMore && (
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

    