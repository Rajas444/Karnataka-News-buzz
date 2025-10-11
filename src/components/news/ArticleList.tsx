
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Timestamp,
  where,
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
  
  // Use a ref to store the timestamp of when the component loads.
  const loadTime = useRef(new Date());

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

    // Set up a real-time listener for new articles published *after* the page initially loaded.
    const q = query(
        collection(db, 'articles'), 
        where('publishedAt', '>', Timestamp.fromDate(loadTime.current)),
        orderBy('publishedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const newArticle = { id: change.doc.id, ...change.doc.data() } as Article;
                 if (newArticle.publishedAt) {
                  newArticle.publishedAt = (newArticle.publishedAt as Timestamp).toDate().toISOString();
                }
                // Prepend the new article to the list, avoiding duplicates.
                setArticles(prev => {
                    if (prev.some(a => a.id === newArticle.id)) {
                        return prev; // Already exists, do nothing
                    }
                    return [newArticle, ...prev];
                });
            }
        });
    }, (error) => {
        console.error("Real-time update failed:", error);
    });

    return () => unsubscribe();
    // The loadTime.current is stable and should not be in dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <h2 className="text-2xl font-bold mb-4 font-kannada">ಯಾವುದೇ ಲೇಖನಗಳು ಕಂಡುಬಂದಿಲ್ಲ</h2>
        <p className="text-muted-foreground font-kannada">
          ಆಯ್ದ ಫಿಲ್ಟರ್‌ಗಳಿಗಾಗಿ ಯಾವುದೇ ಲೇಖನಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಬೇರೆ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.
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
            {loadingMore ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'ಇನ್ನಷ್ಟು ಸುದ್ದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ'}
          </Button>
        </div>
      )}
    </div>
  );
}
