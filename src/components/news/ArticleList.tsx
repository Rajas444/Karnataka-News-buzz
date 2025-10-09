
'use client';

import { useState, useEffect, useCallback } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2 } from 'lucide-react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisibleDocId, setLastVisibleDocId] = useState<string | null>(initialLastVisibleDocId || null);
  const [hasMore, setHasMore] = useState(initialArticles.length > 0 && !!initialLastVisibleDocId);
  const { toast } = useToast();

  useEffect(() => {
    // When the initial articles from the server change (e.g., due to filter change),
    // reset the state of this component.
    setArticles(initialArticles);
    setLastVisibleDocId(initialLastVisibleDocId);
    setHasMore(initialArticles.length > 0 && !!initialLastVisibleDocId);
  }, [initialArticles, initialLastVisibleDocId]);
  
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const fetchedCategories = await getCategories();
        setAllCategories(fetchedCategories);
      } catch (e) {
        console.error("Failed to fetch categories for ArticleList", e);
      }
    }
    fetchInitialData();

    // Simplified Real-time listener for new articles
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const newArticle = { id: change.doc.id, ...change.doc.data() } as Article;
                // Avoid adding duplicates if the article is already in the list
                setArticles(prev => {
                    if (prev.find(a => a.id === newArticle.id)) {
                        return prev;
                    }
                    console.log("New article detected, prepending to list:", newArticle.title);
                    return [newArticle, ...prev];
                });
            }
        });
    }, (error) => {
        console.error("Real-time update failed:", error);
    });

    return () => unsubscribe();

  }, []);

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
      
      setArticles(prev => [...prev, ...newArticles]);
      setLastVisibleDocId(newLastVisibleDocId);
      setHasMore(newArticles.length > 0 && newLastVisibleDocId !== null);

    } catch (error: any) {
      console.error("Failed to load more articles", error);
      toast({ title: "Failed to load more news", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisibleDocId, toast, categorySlug, districtId]);
  
  if (articles.length === 0) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
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
