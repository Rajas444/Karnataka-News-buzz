
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getArticles } from '@/services/articles';
import { Button } from '../ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, startAfter, limit, Timestamp } from 'firebase/firestore';
import { getCategories } from '@/services/categories';

interface ArticleListProps {
  initialArticles: Article[];
  categorySlug?: string;
  districtId?: string;
  allCategories?: Category[];
}

export default function ArticleList({ initialArticles, categorySlug, districtId, allCategories = [] }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisibleDocId, setLastVisibleDocId] = useState<string | null>(() => {
      if (initialArticles.length > 0) {
        return initialArticles[initialArticles.length - 1].id;
      }
      return null;
  });
  const [hasMore, setHasMore] = useState(initialArticles.length >= 10);
  const { toast } = useToast();

   useEffect(() => {
    setArticles(initialArticles);
    if (initialArticles.length > 0) {
      setLastVisibleDocId(initialArticles[initialArticles.length - 1].id);
      setHasMore(initialArticles.length >= 10);
    } else {
      setHasMore(false);
    }
  }, [initialArticles]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const articlesCollection = collection(db, 'articles');
    let constraints = [
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
    ];

    if (districtId && districtId !== 'all') {
        constraints.push(where('districtId', '==', districtId));
    }
    
    // Note: Firestore doesn't allow array-contains and inequality on another field in the same query.
    // If we were to filter by category, we couldn't reliably sort by date without a specific index.
    // Given the previous errors, we prioritize the district and date query which now has an index.

    const q = query(articlesCollection, ...constraints, limit(10));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const serverArticles: Article[] = [];
        const districts = await getDistricts();

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const district = districts.find(d => d.id === data.districtId)?.name;
            const article: Article = {
                ...data,
                id: doc.id,
                publishedAt: (data.publishedAt as Timestamp)?.toDate().toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
                district: district || undefined,
            } as Article;
            serverArticles.push(article);
        }
        setArticles(serverArticles);
        if (serverArticles.length > 0) {
            setLastVisibleDocId(serverArticles[serverArticles.length - 1].id);
        }
        setHasMore(serverArticles.length >= 10);

    }, (error) => {
        console.error("Real-time update failed:", error);
        toast({
            title: "Could not get live updates",
            description: "Displaying cached news. Real-time updates have been paused.",
            variant: "destructive",
        });
    });

    return () => unsubscribe();
  }, [districtId, categorySlug, toast]);

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
      toast({ title: "Failed to load more news", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisibleDocId, toast, categorySlug, districtId]);
  
  if (articles.length === 0 && !loadingMore) {
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
