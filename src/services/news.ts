
import type { Article } from '@/lib/types';
import { placeholderArticles, placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';

// A mapping from our app's category slugs to newsdata.io category topics.
const categoryMapping: { [key: string]: string } = {
    'politics': 'politics',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'business': 'business',
    'general': 'top', // newsdata.io uses 'top' for general headlines
    'health': 'health',
    'science': 'science',
};

export async function fetchNews(categorySlug: string = 'general', district?: string): Promise<Article[]> {
    const apiKey = process.env.NEWSDATA_API_KEY;

    if (!apiKey) {
        console.error("newsdata.io API key is missing. Falling back to placeholder data.");
        return placeholderArticles;
    }

    const newsDataCategory = categoryMapping[categorySlug] || 'top';
    
    let query = district ? `"${district}" AND "Karnataka"` : 'Karnataka';
    
    // Build the URL for newsdata.io API
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=in&language=en&q=${encodeURIComponent(query)}&category=${newsDataCategory}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`newsdata.io API request failed with status: ${response.status}`, errorBody);
            return [];
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return [];
        }

        const articles: Article[] = data.results.map((item: any, index: number) => {
            const randomDistrict = placeholderDistricts[index % placeholderDistricts.length];
            const randomCategory1 = placeholderCategories.find(c => c.slug === categorySlug) || placeholderCategories[index % placeholderCategories.length];
            const randomCategory2 = placeholderCategories[(index + 3) % placeholderCategories.length];

            return {
                id: item.link, // Using URL as a unique ID
                title: item.title,
                content: item.content || item.description || '',
                imageUrl: item.image_url,
                author: item.source_id || 'Unknown Source',
                authorId: item.source_id || 'unknown',
                categoryIds: [randomCategory1.id, randomCategory2.id], 
                districtId: randomDistrict.id,
                status: 'published' as 'published' | 'draft' | 'scheduled',
                publishedAt: new Date(item.pubDate),
                createdAt: new Date(item.pubDate),
                updatedAt: new Date(item.pubDate),
                seo: {
                    keywords: item.keywords || (item.title ? item.title.split(' ').slice(0, 3) : []),
                    metaDescription: item.description || '',
                },
                views: Math.floor(Math.random() * 5000), // a random number for views
                'data-ai-hint': `${newsDataCategory} news`,
            }
        }).filter((article): article is Article => article.title && article.content); // Filter out articles with no title or content

        return articles;
    } catch (error) {
        console.error("Failed to fetch news from newsdata.io:", error);
        return []; // Return empty array on network or other errors
    }
}
