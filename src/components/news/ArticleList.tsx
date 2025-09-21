
'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCategories } from '@/services/categories';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, Timestamp, QueryConstraint } from 'firebase/firestore';

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
        if (allCategories.length === 0) return; // Wait for categories to be loaded

        setLoading(true);

        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(50)
        ];

        const selectedCategory = categorySlug && allCategories.find(c => c.slug === categorySlug);

        if (selectedCategory) {
            constraints.unshift(where('categoryIds', 'array-contains', selectedCategory.id));
        }

        if (districtId && districtId !== 'all') {
            constraints.unshift(where('districtId', '==', districtId));
        }

        const q = query(collection(db, 'articles'), ...constraints);

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const articlesFromSnapshot = await Promise.all(
                querySnapshot.docs.map(doc => serializeArticleFromDoc(doc))
            );
            setArticles(articlesFromSnapshot);
            setLoading(false);
        }, (error) => {
            console.error("Real-time listener failed:", error);
            if (error.code === 'failed-precondition') {
                const requiredIndexUrl = error.message.match(/https?:\/\/[^\s]+/);
                const readableError = `Query for real-time articles failed due to missing Firestore index. The app will function with initial data, but for optimal performance and real-time updates, please create the index here: ${requiredIndexUrl ? requiredIndexUrl[0] : 'Check Firestore console.'}`;
                console.warn(readableError);
            } else {
                toast({
                    title: 'Could not load real-time updates.',
                    description: 'Displaying initial articles only.',
                    variant: 'destructive'
                });
            }
            setArticles(initialArticles); // Fallback to server-rendered articles
            setLoading(false);
        });

        return () => unsubscribe();

    }, [categorySlug, districtId, allCategories, toast, initialArticles]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {initialArticles.slice(0, 4).map((article) => (
                    <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
                ))}
            </div>
        );
    }

    if (articles.length === 0) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles.map((article) => (
                <ArticleCard key={article.id || article.sourceUrl} article={article} allCategories={allCategories} />
            ))}
        </div>
    );
}
