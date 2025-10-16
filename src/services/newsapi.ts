
'use server';

import type { Article as NewsApiArticle } from '@/lib/types';

interface NewsDataIOArticle {
    article_id: string;
    title: string;
    link: string;
    description: string;
    content: string;
    pubDate: string;
    image_url: string;
    source_id: string;
    source_url: string;
    creator: string[] | null;
}

async function fetchFromNewsDataAPI(options?: { q?: string }): Promise<NewsApiArticle[]> {
    const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY; // This now holds the NewsData.io key
    if (!apiKey || apiKey.includes("your_") || apiKey.length < 20) {
        console.warn("Newsdata.io API key is not configured correctly. External news feed will be empty.");
        return [];
    }
    
    // Hardcode query to always search for Karnataka news
    const query = 'karnataka';
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=kn&country=in`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            const errorBody = await response.json();
             if (response.status === 403) {
                console.error(`Newsdata.io API request failed with status 403 (Forbidden). This usually means your API key is invalid, has expired, or your plan has hit its limit. Please check your Newsdata.io dashboard.`);
            } else {
                console.error(`Newsdata.io API request failed with status: ${response.status}`, errorBody);
            }
            return [];
        }
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) return [];

        return data.results.map((article: NewsDataIOArticle): NewsApiArticle => ({
            id: article.link, // Use link as a unique ID
            title: article.title,
            content: article.description || article.content || '',
            imageUrl: article.image_url,
            author: article.creator?.[0] || article.source_id,
            publishedAt: article.pubDate,
            source: article.source_id,
            sourceUrl: article.link,
            authorId: 'newsdataio-api',
            categoryIds: ['external'],
            status: 'published',
            seo: { keywords: [], metaDescription: article.description || '' },
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch from Newsdata.io API:", error);
        return [];
    }
}

export async function getExternalNews(options?: { type?: 'everything' | 'top-headlines', q?: string }): Promise<NewsApiArticle[]> {
    // The 'type' and 'q' options are maintained for compatibility but the query is now fixed.
    return await fetchFromNewsDataAPI();
}
