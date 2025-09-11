
'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';

type FetchNewsResponse = {
    articles: NewsdataArticle[];
    nextPage: string | null;
}

export async function fetchNews(category?: string, page?: string | null, district?: string): Promise<FetchNewsResponse> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.error('Newsdata.io API key is not set.');
        throw new Error('Newsdata.io API key is missing. Please add it to your .env file.');
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('language', 'kn');
    url.searchParams.append('country', 'in');

    const queryParts: string[] = [];
    
    const isGeneralCategory = !category || category === 'general';

    if (district && district !== 'all') {
        queryParts.push(district);
    }
    
    if (isGeneralCategory && (!district || district === 'all')) {
        queryParts.push('Karnataka');
    }
    
    if (queryParts.length > 0) {
        url.searchParams.append('q', queryParts.join(' AND '));
    }

    if (category && category !== 'general') {
        url.searchParams.append('category', category);
    }
    
    if (page) {
        url.searchParams.append('page', page);
    }

    try {
        const response = await fetch(url.toString(), { cache: 'no-store' });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.json();
                console.error('Newsdata.io API error response:', errorBody);

                if (errorBody.results && errorBody.results.message) {
                    errorMessage = errorBody.results.message;
                } else if (typeof errorBody.results === 'string') {
                    errorMessage = errorBody.results;
                } else if (errorBody.message) {
                    errorMessage = errorBody.message;
                }
            } catch (e) {
                console.error('Could not parse Newsdata.io error response as JSON.');
            }
            throw new Error(`Failed to fetch news: ${errorMessage}`);
        }

        const data: NewsdataResponse = await response.json();

        if (data.status !== 'success') {
            console.error('Newsdata.io API non-success status:', data);
            // Specifically check for API key issues from their typical response format
            if ((data as any).results?.code === 'Unauthorized') {
                 throw new Error(`Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`);
            }
            throw new Error(`API returned status: ${data.status}. Check Newsdata.io dashboard for issues.`);
        }

        return {
            articles: data.results || [],
            nextPage: data.nextPage || null,
        };
    } catch (error) {
        console.error("Failed to fetch news from Newsdata.io:", error);
        if (error instanceof Error) {
            // Re-throw the original error to preserve the specific message
            throw error;
        }
        throw new Error('An unknown error occurred while fetching news.');
    }
}
