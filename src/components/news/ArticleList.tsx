
'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getArticles } from '@/services/articles';
import { getCategories } from '@/services/categories';


interface ArticleListProps {
    initialArticles: Article[];
    category?: string;
    district?: string;
}

export default function ArticleList({ initialArticles, category, district }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [allCategories, setAllCategories] = useState<{id: string, name: string}[]>([]);
    const [lastVisible, setLastVisible] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialArticles.length > 0);
    const { toast } = useToast();
    
    // Reset articles when filters change
    useEffect(() => {
        setArticles(initialArticles);
        setHasMore(initialArticles.length > 0);
        // We will set the new `lastVisible` after the first fetch
        setLastVisible(null);
    }, [initialArticles]);
    
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const fetchedCategories = await getCategories();
                setAllCategories(fetchedCategories);
                if (initialArticles.length > 0) {
                     // We need to fetch the *next* page's context
                    const res = await getArticles({ category, district, pageSize: initialArticles.length });
                    setLastVisible(res.lastVisible);
                    setHasMore(!!res.lastVisible);
                }
            } catch(e) {
                console.error("Failed to fetch initial article list data", e);
            }
        }
        fetchInitialData();
    }, [initialArticles.length, category, district]);


    const handleLoadMore = async () => {
        if (!hasMore || isLoading || !lastVisible) return;

        setIsLoading(true);
        try {
            const { articles: newArticles, lastVisible: newLastVisible } = await getArticles({
                category,
                district,
                lastVisible,
            });
            setArticles(prev => [...prev, ...newArticles]);
            setLastVisible(newLastVisible);
            setHasMore(!!newLastVisible && newArticles.length > 0);
        } catch (error: any) {
            console.error("Failed to fetch more articles:", error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch more articles.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (articles.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg">
                <h2 className="text-2xl font-bold mb-4 font-kannada">No Articles Found</h2>
                <p className="text-muted-foreground font-kannada">
                    There are no articles available for the selected filters. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} allCategories={allCategories} />
                ))}
            </div>
            
            {hasMore && (
                 <div className="text-center mt-12">
                    <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? 'Loading...' : 'Load More Articles'}
                    </Button>
                </div>
            )}
        </div>
    );
}
