
'use server';

import type { Article as NewsApiArticle } from '@/lib/types';

// This is a placeholder for the full NewsAPI article type
interface NewsDataArticleDTO {
    article_id: string;
    title: string;
    description: string | null;
    link: string;
    image_url: string | null;
    pubDate: string;
    source_id: string;
    content: string | null;
}

// Function to fetch news from NewsAPI.org
async function fetchFromNewsDataAPI(options?: { q?: string }): Promise<NewsApiArticle[]> {
    const apiKey = process.env.NEWS_DATA_API_KEY;
    if (!apiKey || apiKey === "your_news_data_api_key_here") {
        console.warn("NewsData.io API key is not configured. External news feed will be empty.");
        return [];
    }
    
    const query = options?.q ? `&q=${encodeURIComponent(options.q)}` : '';

    // Fetching recent news from India in Kannada language
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=in&language=kn${query}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`NewsData.io request failed with status: ${response.status}`, errorBody);
            return [];
        }
        const data = await response.json();
        
        // Map the API response to our local Article type
        return data.results.map((article: NewsDataArticleDTO) => ({
            id: article.link, // Use URL as a unique ID for external articles
            title: article.title,
            content: article.description || '',
            imageUrl: article.image_url,
            author: article.source_id,
            publishedAt: article.pubDate,
            source: article.source_id,
            sourceUrl: article.link,
            // Fill in other required fields with default values
            authorId: 'news-data-api',
            categoryIds: ['external'],
            status: 'published',
            seo: { keywords: [], metaDescription: article.description || '' },
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch from NewsData.io:", error);
        return [];
    }
}


export async function getExternalNews(options?: { type?: 'everything' | 'top-headlines', q?: string }): Promise<NewsApiArticle[]> {
    // For now, we only fetch from the primary endpoint of NewsData.io
    return await fetchFromNewsDataAPI({ q: options?.q });
}

