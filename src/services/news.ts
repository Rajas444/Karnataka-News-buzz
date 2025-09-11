
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

    if(category && category !== 'general') {
        url.searchParams.append('category', category);
    }

    if (districtName) {
        // Use qInTitle to search for the district name in the article title
        url.searchParams.append('qInTitle', districtName);
    }

    if (page) {
        url.searchParams.append('page', page);
    }

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                // Try to parse the error body as JSON
                const errorBody = await response.json();
                console.error('Newsdata.io API error:', errorBody);
                errorMessage = errorBody.results?.message || errorMessage;
            } catch (e) {
                // If parsing fails, the body might not be JSON. We'll stick with the status text.
                console.error('Could not parse Newsdata.io error response as JSON.');
            }
            throw new Error(`Failed to fetch news: ${errorMessage}`);
        }

        const data: NewsdataResponse = await response.json();

        if (data.status !== 'success') {
            throw new Error(`API returned status: ${data.status}`);
        }

        return {
            articles: data.results || [],
            nextPage: data.nextPage || null,
        };
    } catch (error) {
        console.error("Failed to fetch news from Newsdata.io:", error);
        throw new Error('Failed to load news. Please try again later.');
    }
}
