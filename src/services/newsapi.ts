
'use server';

import type { Article as NewsApiArticle } from '@/lib/types';

interface GNewsArticleDTO {
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

// Function to fetch news from GNews API
async function fetchFromGNewsAPI(options?: { q?: string }): Promise<NewsApiArticle[]> {
    const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
    if (!apiKey || apiKey === "your_gnews_api_key_here") {
        console.warn("GNews API key is not configured. External news feed will be empty.");
        return [];
    }
    
    const query = options?.q ? `&q=${encodeURIComponent(options.q)}` : '';
    
    // Fetching top headlines from India in Kannada language.
    const url = `https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=kn&country=in${query}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`GNews API request failed with status: ${response.status}`, errorBody);
            return [];
        }
        const data = await response.json();
        
        // Map the API response to our local Article type
        return data.articles.map((article: GNewsArticleDTO) => ({
            id: article.url, // Use URL as a unique ID for external articles
            title: article.title,
            content: article.description || article.content || '',
            imageUrl: article.image,
            author: article.source.name,
            publishedAt: article.publishedAt,
            source: article.source.name,
            sourceUrl: article.url,
            // Fill in other required fields with default values
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
