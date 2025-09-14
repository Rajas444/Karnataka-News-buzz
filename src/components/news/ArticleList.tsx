
'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { getArticles } from '@/services/articles';
import { getCategories } from '@/services/categories';
import { useToast } from '@/hooks/use-toast';

interface ArticleListProps {
    initialArticles: Article[];
    initialLastVisible: any | null;
    category?: string;
    district?: string;
    date?: Date;
}

export default function ArticleList({ initialArticles, initialLastVisible, category, district, date }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [lastVisible, setLastVisible] = useState<any | null>(initialLastVisible);
    const [isLoading, setIsLoading] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchCategories() {
            try {
                const cats = await getCategories();
                setAllCategories(cats);
            } catch (error) {
                toast({ title: 'Failed to load categories', variant: 'destructive' });
            }
        }
        fetchCategories();
    }, [toast]);
    
    // This effect resets the articles when the filters change.
    useEffect(() => {
        setArticles(initialArticles);
        setLastVisible(initialLastVisible);
    }, [initialArticles, initialLastVisible]);


    const handleLoadMore = async () => {
        if (!lastVisible || isLoading) return;

        setIsLoading(true);
        try {
            const { articles: newArticles, lastVisible: newLastVisible } = await getArticles({
                category,
                date,
                lastVisible: lastVisible,
                pageSize: 10
            });
            setArticles(prev => [...prev, ...newArticles]);
            setLastVisible(newLastVisible);
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

    return (
        <div>
            {articles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} allCategories={allCategories} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-card rounded-lg">
                    <p className="text-muted-foreground">No more articles found for the selected filters.</p>
                </div>
            )}
            
            {lastVisible && (
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
