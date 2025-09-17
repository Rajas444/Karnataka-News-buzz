
'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';
import { storeCollectedArticle } from './articles';


export async function fetchAndStoreNews(category?: string, district?: string): Promise<void> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('Newsdata.io API key is not set. Skipping news fetch.');
        // This is not an error, as the app can function with existing DB data.
        return;
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('language', 'kn');
    url.searchParams.append('country', 'in');

    const queryParts: string[] = [];
    
    if (district && district !== 'all') {
        queryParts.push(district);
    } else {
        queryParts.push('Karnataka');
    }
    
    if (queryParts.length > 0) {
        url.searchParams.append('q', queryParts.join(' AND '));
    }

    if (category && category !== 'general') {
        url.searchParams.append('category', category);
    }
    
    // We only fetch the first page to get the latest news
    // Pagination will be handled by our own database reads
    try {
        const response = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache for 1 hour
        
        if (!response.ok) {
             if (response.status === 401) {
                throw new Error(`Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`);
            }
             const errorData = await response.json().catch(() => ({}));
             const errorMessage = errorData?.results?.message || `API request failed with status ${response.status}`;
             if (errorData?.results?.code === 'TooManyRequests') {
                throw new Error('Newsdata.io API rate limit exceeded. Please try again later.');
             }
             if (errorData?.results?.code === 'PlanFeatureExceeded') {
                // This is a common issue on free plans. We don't want to block the app.
                console.warn('Newsdata.io plan feature exceeded. Cannot use date filter.');
                return; // Gracefully exit without throwing an error
             }
             throw new Error(`Newsdata.io Error: ${errorMessage}`);
        }

        const data: NewsdataResponse = await response.json();

        if (data.status !== 'success') {
             const results = (data as any).results;
             let errorMessage = `API returned status: ${data.status}. Check Newsdata.io dashboard for issues.`;
             if (results?.code === 'Unauthorized') {
                 errorMessage = `Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`;
             } else if (results?.message) {
                 errorMessage = `Newsdata.io Error: ${results.message}`;
             }
            throw new Error(errorMessage);
        }

        if (data.results && data.results.length > 0) {
            // Asynchronously store all fetched articles
            await Promise.all(data.results.map(article => storeCollectedArticle(article)));
        }

    } catch (error) {
        console.error("Failed to fetch or store news from Newsdata.io:", error);
        if (error instanceof Error) {
            // Re-throw known errors to be displayed to the user
            throw error;
        }
        // Fallback for unknown or network errors
        throw new Error('An unknown error occurred while fetching news.');
    }
}
