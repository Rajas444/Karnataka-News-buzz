
'use server';

import type { Article as NewsApiArticle } from '@/lib/types';

interface GNewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

async function fetchFromGNewsAPI(options?: { q?: string }): Promise<NewsApiArticle[]> {
    const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
    if (!apiKey || apiKey === "your_gnews_api_key_here") {
        console.warn("GNews API key is not configured. External news feed will be empty.");
        return [];
    }
    
    const query = options?.q ? `&q=${encodeURIComponent(options.q)}` : 'karnataka';
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=kn&country=in&apikey=${apiKey}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            const errorBody = await response.json();
            if (response.status === 403) {
                console.error(`GNews API request failed with status 403 (Forbidden). This usually means your API key is invalid, has expired, or your plan has hit its limit. Please check your GNews dashboard.`);
            } else {
                console.error(`GNews API request failed with status: ${response.status}`, errorBody);
            }
            return [];
        }
        const data = await response.json();
        
        if (!data.articles) return [];

        return data.articles.map((article: GNewsArticle): NewsApiArticle => ({
            id: article.url, 
            title: article.title,
            content: article.description || article.content || '',
            imageUrl: article.image,
            author: article.source.name,
            publishedAt: article.publishedAt,
            source: article.source.name,
            sourceUrl: article.url,
            authorId: 'gnews-api',
            categoryIds: ['external'],
            status: 'published',
            seo: { keywords: [], metaDescription: article.description || '' },
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch from GNews API:", error);
        return [];
    }
}

export async function getExternalNews(options?: { type?: 'everything' | 'top-headlines', q?: string }): Promise<NewsApiArticle[]> {
    return await fetchFromGNewsAPI({ q: options?.q });
}
