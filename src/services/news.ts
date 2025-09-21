

'use server';

import type { NewsdataArticle, NewsdataResponse, GnewsResponse, GnewsArticle } from '@/lib/types';
import { storeCollectedArticle } from './articles';
import { getDistricts } from './districts';
import { getCategories } from './categories';

function mapGnewsToNewsdata(article: GnewsArticle): NewsdataArticle {
    return {
        article_id: article.url, // Using URL as a unique ID
        title: article.title,
        link: article.url,
        description: article.description,
        image_url: article.image,
        pubDate: article.publishedAt,
        source_id: article.source.name,
        category: [], // GNews doesn't provide categories
        country: ['in'],
        language: 'kn', // Assuming Kannada, as per original intent
        creator: [article.source.name],
        content: article.content,
        keywords: [], // GNews doesn't provide keywords
    };
}


async function fetchFromGNews(query: string): Promise<GnewsArticle[]> {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
        console.warn('GNews fetching is disabled. No API key found.');
        return [];
    }

    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('lang', 'kn');
    url.searchParams.append('country', 'in');
    url.searchParams.append('q', query);

    try {
        const response = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`GNews API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data: GnewsResponse = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error("Failed to fetch from GNews:", error);
        return [];
    }
}


export async function fetchAndStoreNews(category?: string, districtName?: string, districtId?: string): Promise<void> {
    const newsdataApiKey = process.env.NEWSDATA_API_KEY;
    
    if (!newsdataApiKey || newsdataApiKey === 'YOUR_API_KEY_HERE' || newsdataApiKey === '') {
        console.warn('Newsdata.io fetching is disabled. No API key found.');
        return;
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', newsdataApiKey);
    url.searchParams.append('language', 'kn');
    url.searchParams.append('country', 'in');
    
    let queryTerm = 'Karnataka';
    if (districtName) {
        // Special handling for Bengaluru districts to cast a wider net
        if (districtName.toLowerCase().includes('bengaluru')) {
            queryTerm = 'Bengaluru';
        } else {
            // Use quotes for multi-word district names to get more specific results
            queryTerm = `"${districtName}"`;
        }
    }

    url.searchParams.append('q', queryTerm);

    if (category && category !== 'general') {
        url.searchParams.append('category', category);
    }
    
    let fetchedArticles: NewsdataArticle[] = [];

    try {
        const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({}));
             let errorMessage = errorData?.results?.message || `API request failed with status ${response.status}`;
             
             if (response.status === 401 || errorData?.results?.code === 'Unauthorized') {
                 errorMessage = `Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`;
             } else if (errorData?.results?.code === 'TooManyRequests') {
                console.warn('Newsdata.io API rate limit exceeded. Please try again later.');
             } else if (errorData?.results?.code === 'PlanFeatureExceeded') {
                console.warn('Newsdata.io plan feature exceeded. Cannot use certain filters.');
             } else if (errorMessage.includes('domain')) {
                console.warn(`Newsdata.io domain error ignored: ${errorMessage}`);
             } else {
                 throw new Error(`Newsdata.io Error: ${errorMessage}`);
             }
        } else {
            const data: NewsdataResponse = await response.json();
            if (data.status === 'success' && data.results) {
                fetchedArticles = data.results;
            } else if ((data as any).results?.message) {
                 throw new Error(`Newsdata.io Error: ${(data as any).results.message}`);
            }
        }

        if (fetchedArticles.length > 0) {
            await Promise.all(fetchedArticles.map(article => storeCollectedArticle(article, districtId, category)));
        }

    } catch (error) {
        console.error("Failed to fetch or store news:", error);
        // Silently fail in production to avoid breaking the page, but log the error.
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }
    }
}
