
'use server';

import type { Article as NewsApiArticle } from '@/lib/types';

interface NewsDataArticleDTO {
    article_id: string;
    title: string;
    link: string;
    keywords: string[] | null;
    creator: string[] | null;
    video_url: string | null;
    description: string | null;
    content: string;
    pubDate: string;
    image_url: string | null;
    source_id: string;
    source_priority: number;
    country: string[];
    category: string[];
    language: string;
}

// Function to fetch news from NewsData.io API
async function fetchFromNewsDataAPI(options?: { q?: string }): Promise<NewsApiArticle[]> {
    const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
    if (!apiKey || apiKey === "your_newsdata_api_key_here") {
        console.warn("NewsData.io API key is not configured. External news feed will be empty.");
        return [];
    }
    
    // Using `q` for keyword search, defaulting to 'karnataka' if not provided.
    // Focusing on Kannada language news from India.
    const query = options?.q ? `&q=${encodeURIComponent(options.q)}` : '&q=karnataka';
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=kn&country=in${query}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`NewsData.io API request failed with status: ${response.status}`, errorBody);
            return [];
        }
        const data = await response.json();
        
        if (!data.results) return [];

        // Map the API response to our local Article type
        return data.results.map((article: NewsDataArticleDTO): NewsApiArticle => ({
            id: article.link, // Use URL as a unique ID for external articles
            title: article.title,
            content: article.description || article.content || '',
            imageUrl: article.image_url,
            author: article.creator ? article.creator.join(', ') : article.source_id,
            publishedAt: article.pubDate,
            source: article.source_id,
            sourceUrl: article.link,
            authorId: 'newsdata-api',
            categoryIds: article.category || ['external'],
            status: 'published',
            seo: { keywords: article.keywords || [], metaDescription: article.description || '' },
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch from NewsData.io API:", error);
        return [];
    }
}


export async function getExternalNews(options?: { type?: 'everything' | 'top-headlines', q?: string }): Promise<NewsApiArticle[]> {
    // We are now using NewsData.io as the primary external news source.
    return await fetchFromNewsDataAPI({ q: options?.q });
}
