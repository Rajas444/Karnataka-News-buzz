
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
        setIsFallback(false);
        setLoading(true);

        const selectedCategory = categorySlug ? allCategories.find(c => c.slug === categorySlug) : null;
        
        // Don't run listener until categories are loaded if a categorySlug is present
        if (categorySlug && allCategories.length > 0 && !selectedCategory) {
            setArticles([]);
            setLoading(false);
            return;
        }

        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(50)
        ];

        // *** IMPORTANT ***
        // To prevent missing index errors, we only apply ONE of the two filters on the backend.
        // The category filter is more specific, so we prioritize it.
        // The district filter will be applied on the client-side if a category is also selected.
        if (selectedCategory) {
            constraints.unshift(where('categoryIds', 'array-contains', selectedCategory.id));
        } else if (districtId && districtId !== 'all') {
            constraints.unshift(where('districtId', '==', districtId));
        }

        // If both are selected, we engage a client-side filter fallback.
        const useClientSideDistrictFilter = !!(selectedCategory && districtId && districtId !== 'all');
        if (useClientSideDistrictFilter) {
            setIsFallback(true);
        }

        let unsubscribe: (() => void) | undefined;

        try {
            const q = query(collection(db, 'articles'), ...constraints);

            unsubscribe = onSnapshot(q, async (querySnapshot) => {
                let articlesFromSnapshot = await Promise.all(
                    querySnapshot.docs.map(doc => serializeArticleFromDoc(doc))
                );

                if (useClientSideDistrictFilter) {
                    articlesFromSnapshot = articlesFromSnapshot.filter(
                        article => article.districtId === districtId
                    );
                }

                setArticles(articlesFromSnapshot);
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
             if (error.code === 'failed-precondition') {
                const requiredIndexUrl = error.message.match(/https?:\/\/[^\s]+/);
                const readableError = `Query for real-time articles failed due to missing Firestore index. The app will function with initial data, but for optimal performance and real-time updates, please create the index here: ${requiredIndexUrl ? requiredIndexUrl[0] : 'Check Firestore console.'}`;
                console.warn(readableError);
                 toast({
                    title: 'Real-time updates paused',
                    description: 'A database index is needed for this filter. Displaying initial results only.',
                    variant: 'default',
                    duration: 10000
                });
            } else {
                 console.error("An unexpected error occurred setting up the real-time listener:", error);
                 toast({
                    title: 'Could not load real-time updates.',
                    description: 'Displaying initial articles only.',
                    variant: 'destructive'
                });
            }
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
            {isFallback && (
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Complex Filter Applied</AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Real-time updates are paused for this specific filter combination. The list will not update automatically.
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.map((article) => (
                    <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
                ))}
            </div>
        </div>
    );
}
