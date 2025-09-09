import type { Article } from '@/lib/types';
import { placeholderArticles } from '@/lib/placeholder-data';

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

    // Temporarily bypass the API call to avoid 403 errors and use placeholders.
    // This allows development to continue while the GNews API key issue is investigated.
    console.warn("GNews API fetch is temporarily disabled due to a persistent 403 error. Returning placeholder data.");
    if (true) { // This condition can be removed once the API key issue is resolved.
        const filteredByCategory = placeholderArticles.filter(article => 
            categorySlug === 'general' || article.categoryIds.includes(
                Object.keys(categoryMapping).find(key => categoryMapping[key] === categorySlug) || ''
            )
        );

        const filteredByDistrict = district
            ? filteredByCategory.filter(article => article.districtId === district)
            : filteredByCategory;
        
        return filteredByDistrict.length > 0 ? filteredByDistrict : filteredByCategory;
    }


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


    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`GNews API request failed with status: ${response.status}`);
            const errorBody = await response.json();
            console.error("Error details:", errorBody);
            return placeholderArticles; // Fallback to placeholders on API error
        }

        const data = await response.json();

        if (!data.articles) {
            return [];
        }

        const articles: Article[] = data.articles.map((item: any) => ({
            id: item.url, // Using URL as a unique ID
            title: item.title,
            content: item.content || item.description,
            imageUrl: item.image,
            author: item.source.name,
            authorId: item.source.url || item.source.name,
            categoryIds: [categorySlug], // Assign the current category slug
            districtId: district || '', // Assign the current district if available
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
        }));

        return articles;
    } catch (error) {
        console.error("Failed to fetch news from GNews API:", error);
        return placeholderArticles; // Fallback to placeholders on network or other errors
    }
}
