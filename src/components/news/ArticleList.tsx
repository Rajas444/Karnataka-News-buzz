
'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCategories } from '@/services/categories';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, Timestamp, QueryConstraint } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ArticleListProps {
    initialArticles: Article[];
    categorySlug?: string;
    districtId?: string;
}

async function serializeArticleFromDoc(doc: any): Promise<Article> {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt ? (data.publishedAt as Timestamp).toDate().toISOString() : null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null,
    } as Article;
}

export default function ArticleList({ initialArticles, categorySlug, districtId }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchInitialCategories() {
            try {
                const fetchedCategories = await getCategories();
                setAllCategories(fetchedCategories);
            } catch (e) {
                console.error("Failed to fetch categories for ArticleList", e);
                toast({ title: 'Error loading category data', variant: 'destructive' });
            }
        }
        fetchInitialCategories();
    }, [toast]);

    useEffect(() => {
        setLoading(true);

        const selectedCategory = categorySlug ? allCategories.find(c => c.slug === categorySlug) : null;
        
        if (categorySlug && allCategories.length > 0 && !selectedCategory) {
            setArticles([]);
            setLoading(false);
            return;
        }

        // Always use a simple query to prevent index errors.
        // Filtering will be done on the client side.
        const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(100));

        let unsubscribe: (() => void) | undefined;

        try {
            unsubscribe = onSnapshot(q, async (querySnapshot) => {
                let articlesFromSnapshot = await Promise.all(
                    querySnapshot.docs.map(doc => serializeArticleFromDoc(doc))
                );

                // Perform all filtering in-memory
                const filteredArticles = articlesFromSnapshot.filter(article => {
                    if (article.status !== 'published') return false;
                    const categoryMatch = selectedCategory ? article.categoryIds?.includes(selectedCategory.id) : true;
                    const districtMatch = (districtId && districtId !== 'all') ? article.districtId === districtId : true;
                    return categoryMatch && districtMatch;
                });

                setArticles(filteredArticles);
                setLoading(false);
            }, (error) => {
                console.error("Real-time listener encountered an error:", error);
                toast({
                    title: 'Real-time updates failed.',
                    description: 'Displaying initial articles only.',
                    variant: 'destructive'
                });
                setArticles(initialArticles); // Fallback to SSR articles
                setLoading(false);
            });
        } catch (error: any) {
             console.error("An unexpected error occurred setting up the real-time listener:", error);
             toast({
                title: 'Could not load real-time updates.',
                description: 'Displaying initial articles only.',
                variant: 'destructive'
            });
            setArticles(initialArticles);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };

    }, [categorySlug, districtId, allCategories, toast, initialArticles]);

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
                    <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
                ))}
            </div>
        </div>
    );
}
