
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
    category?: string;
    district?: string;
}

// Helper function to serialize article data from Firestore snapshot
async function serializeArticleFromSnapshot(doc: any): Promise<Article> {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt ? (data.publishedAt as Timestamp).toDate().toISOString() : null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : null,
    } as Article;
}


export default function ArticleList({ initialArticles, category, district }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    // Fetch all category names for display in cards
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

    // Set up real-time listener for articles
    useEffect(() => {
        setLoading(true);

        const constraints: QueryConstraint[] = [
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(50) // Listen to the 50 latest articles
        ];
        
        // Find the category ID from the slug for querying
        const categoryDoc = category && allCategories.length > 0
            ? allCategories.find(c => c.slug === category)
            : null;

        if (categoryDoc) {
             constraints.unshift(where('categoryIds', 'array-contains', categoryDoc.id));
        }
        if (district && district !== 'all') {
            constraints.unshift(where('districtId', '==', district));
        }

        const q = query(collection(db, 'articles'), ...constraints);

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const articlesFromSnapshot = await Promise.all(
                querySnapshot.docs.map(doc => serializeArticleFromSnapshot(doc))
            );
            setArticles(articlesFromSnapshot);
            setLoading(false);
        }, (error) => {
            console.error("Real-time listener failed:", error);
             if (error.code === 'failed-precondition') {
                 console.warn(`Query failed due to missing Firestore index. The app will function, but for optimal performance, please create the index here: ${error.message.match(/https?:\/\/[^\s]+/)?.[0]}`);
             } else {
                 toast({
                    title: 'Could not load real-time updates.',
                    description: 'Displaying initial articles only.',
                    variant: 'destructive'
                 });
             }
            setLoading(false); // Stop loading even on error
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();

    }, [category, district, allCategories, toast]);


    if (loading) {
        return (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

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
        </div>
    );
}
