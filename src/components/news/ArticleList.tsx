
'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { NewsdataArticle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { fetchNews } from '@/services/news';

interface ArticleListProps {
    initialArticles: NewsdataArticle[];
    initialNextPage: string | null;
    category?: string;
    district?: string;
}

export default function ArticleList({ initialArticles, initialNextPage, category, district }: ArticleListProps) {
    const [articles, setArticles] = useState<NewsdataArticle[]>(initialArticles);
    const [nextPage, setNextPage] = useState<string | null>(initialNextPage);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    // This effect resets the articles when the filters change by listening to the initial props.
    useEffect(() => {
        setArticles(initialArticles);
        setNextPage(initialNextPage);
    }, [initialArticles, initialNextPage]);


    const handleLoadMore = async () => {
        if (!nextPage || isLoading) return;

        setIsLoading(true);
        try {
            const { articles: newArticles, nextPage: newNextPage } = await fetchNews(
                category,
                district,
                nextPage,
            );
            setArticles(prev => [...prev, ...newArticles]);
            setNextPage(newNextPage);
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
                    <ArticleCard key={article.article_id} article={article} />
                ))}
            </div>
            
            {nextPage && (
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
