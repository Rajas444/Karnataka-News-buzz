
'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';
import { storeCollectedArticle } from './articles';
import { getDistricts } from './districts';

export async function fetchAndStoreNews(category?: string, districtName?: string, districtId?: string): Promise<void> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('Newsdata.io API key is not set or is a sample key. Skipping news fetch.');
        return;
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('language', 'kn');
    url.searchParams.append('country', 'in');
    
    let queryTerm = '';
    
    if (districtName) {
        // Use the district name for the external API query.
        // Wrap in quotes if it contains spaces for an exact phrase search.
        queryTerm = districtName.includes(' ') ? `"${districtName}"` : districtName;
    } else {
        // Fallback query if no specific district is selected.
        queryTerm = 'Karnataka OR Bengaluru OR Mysuru OR Mangaluru OR Hubballi';
    }

    url.searchParams.append('q', queryTerm);

    if (category && category !== 'general') {
        url.searchParams.append('category', category);
    }
    
    try {
        const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

        if (!response.ok) {
             if (response.status === 401) {
                throw new Error(`Newsdata.io Error: Invalid API Key. Please check the key in your .env file.`);
            }
             const errorData = await response.json().catch(() => ({}));
             const errorMessage = errorData?.results?.message || `API request failed with status ${response.status}`;
             if (errorData?.results?.code === 'TooManyRequests') {
                console.warn('Newsdata.io API rate limit exceeded. Please try again later.');
                return; // Gracefully exit without throwing an error
             }
             if (errorData?.results?.code === 'PlanFeatureExceeded') {
                console.warn('Newsdata.io plan feature exceeded. Cannot use date filter.');
                return;
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
            // Pass the districtId to the storage function.
            await Promise.all(data.results.map(article => storeCollectedArticle(article, districtId)));
        }

    } catch (error) {
        console.error("Failed to fetch or store news from Newsdata.io:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while fetching news.');
    }
}
