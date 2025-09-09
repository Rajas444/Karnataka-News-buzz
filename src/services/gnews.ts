import type { Article } from '@/lib/types';
import { placeholderArticles, placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';

// A mapping from our app's category slugs to GNews category topics.
const categoryMapping: { [key: string]: string } = {
    'politics': 'politics',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'business': 'business',
    'general': 'general',
    'health': 'health',
    'science': 'science',
    'local-news': 'nation' // GNews doesn't have a specific local news, using 'nation' as a fallback
};

export async function fetchNews(categorySlug: string = 'general', district?: string): Promise<Article[]> {
    const apiKey = process.env.GNEWS_API_KEY;

    // Check if the API key is missing.
    if (!apiKey) {
        console.error("GNews API key is missing. Falling back to placeholder data.");
        return placeholderArticles;
    }

    const gnewsCategory = categoryMapping[categorySlug] || 'general';
    
    // Construct the query. Prioritize district if available.
    let query = district ? `${district} Karnataka` : 'Karnataka';
    if(gnewsCategory !== 'general' && gnewsCategory !== 'nation') {
        query += ` ${gnewsCategory}`;
    }


    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&apikey=${apiKey}&max=10`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`GNews API request failed with status: ${response.status}`, errorBody);
            // Don't fall back to placeholders, show that the fetch failed.
            return [];
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            return [];
        }

        const articles: Article[] = data.articles.map((item: any, index: number) => {
            // Use placeholder categories/districts to keep data consistent for the demo
            const randomDistrict = placeholderDistricts[index % placeholderDistricts.length];
            const randomCategory1 = placeholderCategories[index % placeholderCategories.length];
            const randomCategory2 = placeholderCategories[(index + 3) % placeholderCategories.length];

            return {
                id: item.url, // Using URL as a unique ID
                title: item.title,
                content: item.content || item.description,
                imageUrl: item.image,
                author: item.source.name,
                authorId: item.source.url || item.source.name,
                categoryIds: [randomCategory1.id, randomCategory2.id], 
                districtId: randomDistrict.id,
                status: 'published' as 'published' | 'draft' | 'scheduled',
                publishedAt: new Date(item.publishedAt),
                createdAt: new Date(item.publishedAt),
                updatedAt: new Date(item.publishedAt),
                seo: {
                    keywords: item.title.split(' ').slice(0, 3),
                    metaDescription: item.description,
                },
                views: Math.floor(Math.random() * 5000), // a random number for views
                'data-ai-hint': `${gnewsCategory} news`,
            }
        });

        return articles;
    } catch (error) {
        console.error("Failed to fetch news from GNews API:", error);
        return []; // Return empty array on network or other errors
    }
}
