
'use client';

import { useState } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Article } from '@/lib/types';
import { fetchNews } from '@/services/news';

interface ArticleListProps {
    initialArticles: Article[];
    initialNextPage: string | null;
    category: string;
    district?: string;
    districtName?: string;
}

export default function ArticleList({ initialArticles, initialNextPage, category, districtName }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [nextPage, setNextPage] = useState<string | null>(initialNextPage);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadMore = async () => {
        if (!nextPage || isLoading) return;

        setIsLoading(true);
        try {
            const { articles: newArticles, nextPage: newNextPage } = await fetchNews(category, districtName, nextPage);
            setArticles(prev => [...prev, ...newArticles]);
            setNextPage(newNextPage);
        } catch (error) {
            console.error("Failed to fetch more articles:", error);
            // Optionally, show a toast notification to the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {articles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-card rounded-lg">
                    <p className="text-muted-foreground">No articles found for the selected filters.</p>
                </div>
            )}
            
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
