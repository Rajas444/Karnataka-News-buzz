
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDistricts } from '@/services/districts';

interface ArticleListProps {
  initialArticles: Article[];
  categorySlug?: string;
  districtId?: string;
}

export default function ArticleList({ initialArticles, categorySlug, districtId }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisibleDocId, setLastVisibleDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialArticles.length > 0);
  const { toast } = useToast();
  
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
    
    setArticles(initialArticles);
    
    if (initialArticles.length > 0) {
        const lastInitialArticle = initialArticles[initialArticles.length - 1];
        if (lastInitialArticle && lastInitialArticle.id && !lastInitialArticle.id.startsWith('http')) {
            setLastVisibleDocId(lastInitialArticle.id);
        } else {
            setLastVisibleDocId(null);
        }
        setHasMore(initialArticles.length >= 10); 
    } else {
        setLastVisibleDocId(null);
        setHasMore(false);
    }
  }, [initialArticles]);


  const categoryId = useMemo(() => {
      if (!categorySlug || categorySlug === 'all') return null;
      const category = allCategories.find(c => c.slug === categorySlug);
      return category?.id || null;
  }, [categorySlug, allCategories]);

  useEffect(() => {
    if (!db || articles.length === 0) return;

    const latestArticle = articles[0];
    if (!latestArticle || !latestArticle.publishedAt) return;

    let constraints = [
        where('status', '==', 'published'),
        where('publishedAt', '>', Timestamp.fromDate(new Date(latestArticle.publishedAt))),
        orderBy('publishedAt', 'desc'),
    ];

    if (districtId && districtId !== 'all') {
      constraints.push(where('districtId', '==', districtId));
    }

    if (categoryId) {
      constraints.push(where('categoryIds', 'array-contains', categoryId));
    }

    const q = query(collection(db, 'articles'), ...constraints as any);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) return;
        
        const districts = await getDistricts();
        const newArticles: Article[] = [];

        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const docData = change.doc.data();
                const changedArticle: Article = {
                  id: change.doc.id,
                  title: docData.title,
                  content: docData.content,
                  imageUrl: docData.imageUrl,
                  author: docData.author,
                  authorId: docData.authorId,
                  categoryIds: docData.categoryIds,
                  status: docData.status,
                  publishedAt: (docData.publishedAt.toDate() as Date).toISOString(),
                  createdAt: (docData.createdAt.toDate() as Date).toISOString(),
                  updatedAt: (docData.updatedAt.toDate() as Date).toISOString(),
                  source: docData.source,
                  sourceUrl: docData.sourceUrl,
                  seo: docData.seo,
                  views: docData.views,
                  districtId: docData.districtId,
                  district: districts.find(d => d.id === docData.districtId)?.name,
                };
                newArticles.push(changedArticle);
            }
        });

        if (newArticles.length > 0) {
            setArticles(prev => [...newArticles, ...prev]);
        }
    }, (error) => {
        console.error("Real-time update failed:", error);
    });

    return () => unsubscribe();
  }, [districtId, categoryId, articles]);

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
