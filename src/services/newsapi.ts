
'use server';

import type { Article as NewsApiArticle } from '@/lib/types';
import { getArticles as getLocalArticles } from './articles';

// This is a placeholder for the full NewsAPI article type
interface NewsAPIArticleDTO {
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    source: {
        name: string;
    };
    content: string | null;
}

// Function to fetch news from NewsAPI.org
async function fetchFromNewsAPI(): Promise<NewsApiArticle[]> {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!apiKey || apiKey === "your_news_api_key_here") {
        console.error("NewsAPI key is not configured. Please add it to your .env file.");
        return [];
    }

    // Fetching top headlines from India in English language
    const url = `https://newsapi.org/v2/top-headlines?country=in&language=en&apiKey=${apiKey}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            console.error(`NewsAPI request failed with status: ${response.status}`);
            return [];
        }
        const data = await response.json();
        
        // Map the API response to our local Article type
        return data.articles.map((article: NewsAPIArticleDTO) => ({
            id: article.url, // Use URL as a unique ID for external articles
            title: article.title,
            content: article.description || '',
            imageUrl: article.urlToImage,
            author: article.source.name,
            publishedAt: article.publishedAt,
            source: article.source.name,
            sourceUrl: article.url,
            // Fill in other required fields with default values
            authorId: 'news-api',
            categoryIds: ['external'],
            status: 'published',
            seo: { keywords: [], metaDescription: article.description || '' },
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch from NewsAPI:", error);
        return [];
    }
}


export async function getExternalNews(): Promise<NewsApiArticle[]> {
    return await fetchFromNewsAPI();
}
