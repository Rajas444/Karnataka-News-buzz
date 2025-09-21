

'use server';

import type { NewsdataArticle, NewsdataResponse } from '@/lib/types';
import { storeCollectedArticle } from './articles';
import { getDistricts } from './districts';
import { getCategories } from './categories';

export async function fetchAndStoreNews(category?: string, districtName?: string, districtId?: string): Promise<void> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
        console.warn('News fetching is disabled. No API key found.');
        return;
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('language', 'kn');
    url.searchParams.append('country', 'in');
    
    let queryTerm = 'Karnataka';
    
    if (districtName) {
      if (districtName.toLowerCase().includes('bengaluru')) {
        queryTerm = 'Bengaluru';
      } else {
        queryTerm = `"${districtName}"`;
      }
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
                return;
             }
             if (errorData?.results?.code === 'PlanFeatureExceeded') {
                console.warn('Newsdata.io plan feature exceeded. Cannot use date filter.');
                return;
             }
             if (errorMessage.includes('domain')) {
                console.warn(`Newsdata.io domain error ignored: ${errorMessage}`);
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
            await Promise.all(data.results.map(article => storeCollectedArticle(article, districtId)));
        }

    } catch (error) {
        console.error("Failed to fetch or store news from Newsdata.io:", error);
        if (error instanceof Error) {
            // Silently fail in production to avoid breaking the page, but log the error.
            if (process.env.NODE_ENV !== 'development') {
                return;
            }
            throw error;
        }
        throw new Error('An unknown error occurred while fetching news.');
    }
}
