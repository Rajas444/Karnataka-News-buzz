
'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/news/ArticleCard';
import { Loader2 } from 'lucide-react';
import type { Article, Category, NewsdataArticle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCategories } from '@/services/categories';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, QueryConstraint } from 'firebase/firestore';

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
    }, [toast]);

    useEffect(() => {
        setArticles(initialArticles);
        setLoading(false);

        const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const allPublishedArticles = await Promise.all(
                querySnapshot.docs
                    .map(doc => serializeArticleFromDoc(doc))
                    .filter(article => article.status === 'published')
            );

            // Client-side filtering
            const selectedCategory = (categorySlug && categorySlug !== 'all') ? allCategories.find(c => c.slug === categorySlug) : null;
            
            const filteredArticles = allPublishedArticles.filter(article => {
                const categoryMatch = selectedCategory ? article.categoryIds?.includes(selectedCategory.id) : true;
                const districtMatch = (districtId && districtId !== 'all') ? article.districtId === districtId : true;
                return categoryMatch && districtMatch;
            });
            
            setArticles(filteredArticles);
            setLoading(false);
        }, (error) => {
            console.error("[Real-time listener error]:", error);
            if (error.code === 'failed-precondition') {
                 console.warn(`[Firestore] A query failed due to a missing index. The app is falling back to client-side filtering of initial data. For optimal performance, create the required index in your Firebase console.`);
            } else {
                toast({
                    title: 'Live updates failed.',
                    description: 'Could not connect for live updates. Displaying latest results.',
                    variant: 'destructive'
                });
            }
            // On error, fall back to client-side filtering of the initial articles.
            const selectedCategory = (categorySlug && categorySlug !== 'all') ? allCategories.find(c => c.slug === categorySlug) : null;
            const filteredInitial = initialArticles.filter(article => {
                const categoryMatch = selectedCategory ? article.categoryIds?.includes(selectedCategory.id) : true;
                const districtMatch = (districtId && districtId !== 'all') ? article.districtId === districtId : true;
                return categoryMatch && districtMatch;
            });
            setArticles(filteredInitial);
            setLoading(false);
        });

        return () => {
            unsubscribe();
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
                    <ArticleCard key={(article as NewsdataArticle).article_id || article.id || article.sourceUrl} article={article} allCategories={allCategories} />
                ))}
            </div>
        </div>
    );
}
