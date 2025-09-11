
import type { Article } from '@/lib/types';
import { getArticles } from './articles';
import { placeholderCategories } from '@/lib/placeholder-data';

type FetchNewsResponse = {
    articles: Article[];
    nextPage: string | null;
}

export async function fetchNews(categorySlug: string = 'general', districtName?: string, page?: string | null, language?: string): Promise<FetchNewsResponse> {
    
    try {
        const category = placeholderCategories.find(c => c.slug === categorySlug);
        
        // The user wants to fetch from Firestore, so we'll use getArticles.
        const articles = await getArticles({
             // If you have a mapping from slug to ID, you can use it here.
             categoryId: (category && categorySlug !== 'general') ? category.id : undefined,
             districtName: districtName,
             language: language
        });

        // The getArticles function doesn't support pagination yet, so nextPage is null.
        return { articles, nextPage: null };
    } catch (error) {
        console.error("Failed to fetch news from Firestore:", error);
        return { articles: [], nextPage: null }; // Return empty array on network or other errors
    }
}
