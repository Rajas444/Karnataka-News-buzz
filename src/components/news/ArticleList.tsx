
'use client';

import { useState, useEffect, useCallback } from 'react';
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

const PAGE_SIZE = 9;

export default function ArticleList({ initialArticles, category, district }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [allCategories, setAllCategories] = useState<{id: string, name: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { toast } = useToast();
    
    // This effect runs when the filters (category/district) change, resetting the list.
    useEffect(() => {
        setArticles(initialArticles);
        setHasMore(initialArticles.length >= PAGE_SIZE);
    }, [initialArticles]);
    
    // This effect fetches the category names for display in the cards.
    useEffect(() => {
        async function fetchCategories() {
            try {
                const fetchedCategories = await getCategories();
                setAllCategories(fetchedCategories);
            } catch(e) {
                console.error("Failed to fetch categories", e);
                toast({ title: 'Error loading category data', variant: 'destructive' });
            }
        };
        fetchCategories();
    }, [toast]);

    const handleLoadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        try {
            const lastArticleId = articles.length > 0 ? articles[articles.length - 1].id : undefined;

            const newArticles = await getArticles({
                category,
                district,
                startAfterId: lastArticleId,
                pageSize: PAGE_SIZE + 1 // Request one more to check if there are more pages
            });

            if (newArticles.length > 0) {
                 // The extra item is not for display, just to check if there's more.
                const hasMoreNew = newArticles.length > PAGE_SIZE;
                setHasMore(hasMoreNew);

                // Add only the items for the current page.
                const pageArticles = newArticles.slice(0, PAGE_SIZE);
                setArticles(prev => [...prev, ...pageArticles]);
            } else {
                 setHasMore(false);
            }

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
    }, [hasMore, isLoading, articles, category, district, toast]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                    <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
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
