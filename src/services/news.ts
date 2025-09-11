
'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';

type FetchNewsResponse = {
    articles: NewsdataArticle[];
    nextPage: string | null;
}

export async function fetchNews(page?: string | null): Promise<FetchNewsResponse> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
        console.error('Newsdata.io API key is not set.');
        throw new Error('Failed to load news. API key is missing.');
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('language', 'kn');

    if (page) {
        url.searchParams.append('page', page);
    }

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Newsdata.io API error:', errorBody);
            throw new Error(`Failed to fetch news: ${errorBody.results?.message || response.statusText}`);
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
