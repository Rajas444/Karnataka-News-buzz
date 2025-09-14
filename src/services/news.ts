
'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';
import { format } from 'date-fns';

type FetchNewsResponse = {
    articles: NewsdataArticle[];
    nextPage: string | null;
}

export async function fetchNews(category?: string, district?: string, page?: string | null, date?: Date): Promise<FetchNewsResponse> {
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
    
    // Always include Karnataka for relevance, unless a very specific district is chosen
    if (district && district !== 'all') {
        queryParts.push(district);
    } else {
        queryParts.push('Karnataka');
    }
    
    if (queryParts.length > 0) {
        // Use "OR" for broader results if desired, but "AND" is better for filtering
        url.searchParams.append('q', queryParts.join(' AND '));
    }

    if (category && category !== 'general') {
        url.searchParams.append('category', category);
    }
    
    if (date) {
        // Newsdata.io seems to work best with YYYY-MM-DD for their date filters.
        const formattedDate = format(date, 'yyyy-MM-dd');
        url.searchParams.append('from_date', formattedDate);
        url.searchParams.append('to_date', formattedDate);
    }

    if (page) {
        url.searchParams.append('page', page);
    }

    try {
        const response = await fetch(url.toString(), { cache: 'no-store' });
        
        if (response.status === 401) {
            throw new Error(`Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`);
        }

        const data: NewsdataResponse = await response.json();

        if (data.status !== 'success') {
            console.error('Newsdata.io API non-success status:', data);
            
            const results = (data as any).results;
            const errorMessage = results?.message || `API returned status: ${data.status}. Check Newsdata.io dashboard for issues.`;

            if (results?.code === 'Unauthorized') {
                 throw new Error(`Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`);
            }
            
            throw new Error(errorMessage);
        }

        return {
            articles: data.results || [],
            nextPage: data.nextPage || null,
        };

    } catch (error) {
        console.error("Failed to fetch news from Newsdata.io:", error);
        if (error instanceof Error) {
            // Re-throw known errors to be displayed to the user
            throw error;
        }
        // Fallback for unknown or network errors
        throw new Error('An unknown error occurred while fetching news.');
    }
}
