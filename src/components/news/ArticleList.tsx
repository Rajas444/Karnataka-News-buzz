
'use client';

import { useState, useEffect, useCallback } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCategories } from '@/services/categories';
import { getArticles } from '@/services/articles';
import { Button } from '../ui/button';
import { doc } from 'firebase/firestore';
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
    const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(initialLastVisibleDoc);
    const [hasMore, setHasMore] = useState(initialArticles.length > 0);
    const { toast } = useToast();

    useEffect(() => {
        setArticles(initialArticles);
        setHasMore(initialArticles.length > 0);
        if (initialLastVisibleDoc) {
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
                toast({ title: 'Error loading category data', variant: 'destructive' });
            }
        }
        fetchInitialData();
    }, [initialArticles, initialLastVisibleDoc, toast]);


    const handleLoadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;

        setLoadingMore(true);
        try {
            const { articles: newArticles, lastVisibleDoc: newLastVisibleDoc } = await getArticles({
                pageSize: 10,
                startAfterDoc: lastVisibleDoc,
                category: categorySlug,
                district: districtId,
            });
            
            setArticles(prev => [...prev, ...newArticles]);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.map((article) => (
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
