import type { Article } from '@/lib/types';
import { placeholderArticles, placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';

// A mapping from our app's category slugs to NewsAPI category topics.
const categoryMapping: { [key: string]: string } = {
    'politics': 'politics',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'business': 'business',
    'general': 'general',
    'health': 'health',
    'science': 'science',
};

export async function fetchNews(categorySlug: string = 'general', district?: string): Promise<Article[]> {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        console.error("NewsAPI key is missing. Falling back to placeholder data.");
        return placeholderArticles;
    }

    const newsApiCategory = categoryMapping[categorySlug] || 'general';
    
    let query = district ? `${district} Karnataka` : 'Karnataka';
    
    // NewsAPI uses a 'category' parameter for broad topics, and 'q' for everything else.
    // We will use q for more specific searches and category for general ones.
    let url: string;
    if (categorySlug !== 'general' && categorySlug !== 'local-news') {
         url = `https://newsapi.org/v2/top-headlines?country=in&category=${encodeURIComponent(newsApiCategory)}&q=${encodeURIComponent(query)}&apiKey=${apiKey}&pageSize=10`;
    } else {
         url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${apiKey}&pageSize=10`;
    }


    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`NewsAPI request failed with status: ${response.status}`, errorBody);
            return [];
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            return [];
        }

        const articles: Article[] = data.articles.map((item: any, index: number) => {
            const randomDistrict = placeholderDistricts[index % placeholderDistricts.length];
            const randomCategory1 = placeholderCategories.find(c => c.slug === categorySlug) || placeholderCategories[index % placeholderCategories.length];
            const randomCategory2 = placeholderCategories[(index + 3) % placeholderCategories.length];

            return {
                id: item.url, // Using URL as a unique ID
                title: item.title,
                content: item.content || item.description || '',
                imageUrl: item.urlToImage,
                author: item.source.name,
                authorId: item.source.id || item.source.name,
                categoryIds: [randomCategory1.id, randomCategory2.id], 
                districtId: randomDistrict.id,
                status: 'published' as 'published' | 'draft' | 'scheduled',
                publishedAt: new Date(item.publishedAt),
                createdAt: new Date(item.publishedAt),
                updatedAt: new Date(item.publishedAt),
                seo: {
                    keywords: item.title ? item.title.split(' ').slice(0, 3) : [],
                    metaDescription: item.description || '',
                },
                views: Math.floor(Math.random() * 5000), // a random number for views
                'data-ai-hint': `${newsApiCategory} news`,
            }
        }).filter((article): article is Article => article.title && article.content); // Filter out articles with no title or content

        return articles;
    } catch (error) {
        console.error("Failed to fetch news from NewsAPI:", error);
        return []; // Return empty array on network or other errors
    }
}
