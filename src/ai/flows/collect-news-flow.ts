
'use server';
/**
 * @fileOverview A Genkit flow for collecting news articles from an external API and storing them in Firestore.
 *
 * - collectNewsForDate - A function that fetches news for a given date and stores new articles.
 * - CollectNewsInput - The input type for the collectNewsForDate function.
 * - CollectNewsOutput - The return type for the collectNewsForDate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchNews } from '@/services/news';
import { storeCollectedArticle, articleExists } from '@/services/articles';
import type { NewsdataArticle } from '@/lib/types';
import { getCategories } from '@/services/categories';

const CollectNewsInputSchema = z.object({
  date: z.string().describe('The date to collect news for in ISO 8601 format (YYYY-MM-DD).'),
});
export type CollectNewsInput = z.infer<typeof CollectNewsInputSchema>;

const CollectNewsOutputSchema = z.object({
  articlesFetched: z.number().describe('The total number of articles fetched from the API.'),
  articlesStored: z.number().describe('The number of new articles stored in the database.'),
});
export type CollectNewsOutput = z.infer<typeof CollectNewsOutputSchema>;

export async function collectNewsForDate(input: CollectNewsInput): Promise<CollectNewsOutput> {
  return collectNewsFlow(input);
}

const collectNewsFlow = ai.defineFlow(
  {
    name: 'collectNewsFlow',
    inputSchema: CollectNewsInputSchema,
    outputSchema: CollectNewsOutputSchema,
  },
  async (input) => {
    const targetDate = new Date(input.date);
    let articlesStored = 0;
    let articlesFetched = 0;
    let hasMore = true;
    let nextPage: string | null = null;
    
    const allCategories = await getCategories();

    // Loop to handle pagination from the news API
    while (hasMore) {
      try {
        const response = await fetchNews('general', 'all', nextPage, targetDate);
        articlesFetched += response.articles.length;

        for (const article of response.articles) {
          const exists = await articleExists(article.link);
          if (!exists) {
            // Find the category ID for the article's category
            const category = allCategories.find(c => article.category.includes(c.slug));

            await storeCollectedArticle(article, targetDate, category?.id);
            articlesStored++;
          }
        }

        if (response.nextPage) {
          nextPage = response.nextPage;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error fetching a page of news:', error);
        hasMore = false; // Stop if there's an error
      }
    }

    return {
      articlesFetched,
      articlesStored,
    };
  }
);
