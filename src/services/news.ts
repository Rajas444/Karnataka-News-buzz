
'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';

type FetchNewsResponse = {
    articles: NewsdataArticle[];
    nextPage: string | null;
}

export async function fetchNews(category?: string, districtName?: string, page?: string | null): Promise<FetchNewsResponse> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
        console.error('Newsdata.io API key is not set.');
        throw new Error('Failed to load news. API key is missing.');
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('language', 'kn');
    url.searchParams.append('country', 'in');

    const queryParts: string[] = ['Karnataka'];
    
    if (districtName && districtName !== 'All Districts') {
      // Prioritize district news if selected
      queryParts.push(districtName);
    }
    
    // Using q instead of qInTitle to allow for broader search within content
    url.searchParams.append('q', queryParts.join(' AND '));
    
    if(category && category !== 'general') {
        url.searchParams.append('category', category);
    }

    if (page) {
        url.searchParams.append('page', page);
    }

    try {
        const response = await fetch(url.toString(), { cache: 'no-store' });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                // Try to parse the error body as JSON
                const errorBody = await response.json();
                console.error('Newsdata.io API error:', errorBody);
                errorMessage = errorBody.results?.message || `API error: ${response.status}`;
            } catch (e) {
                // If parsing fails, the body might not be JSON.
                console.error('Could not parse Newsdata.io error response as JSON.');
            }
            throw new Error(`Failed to fetch news: ${errorMessage}`);
        }

        const data: NewsdataResponse = await response.json();

        if (data.status !== 'success') {
             console.error('Newsdata.io API non-success status:', data);
            throw new Error(`API returned status: ${data.status}`);
        }

        return {
            articles: data.results || [],
            nextPage: data.nextPage || null,
        };
    } catch (error) {
        console.error("Failed to fetch news from Newsdata.io:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while fetching news.');
    }
}
