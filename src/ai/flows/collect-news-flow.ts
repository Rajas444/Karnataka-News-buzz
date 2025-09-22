
'use server';
/**
 * @fileOverview A Genkit flow for collecting news articles from an external API and storing them in Firestore.
 *
 * This flow is currently not in use and has been disabled.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  // This flow is disabled.
  console.log('External news collection is disabled. collectNewsForDate was called with:', input);
  return {
    articlesFetched: 0,
    articlesStored: 0,
  };
}

const collectNewsFlow = ai.defineFlow(
  {
    name: 'collectNewsFlow',
    inputSchema: CollectNewsInputSchema,
    outputSchema: CollectNewsOutputSchema,
  },
  async (input) => {
    // This flow is disabled.
    console.log('External news collection is disabled. collectNewsFlow was executed with:', input);
    return {
      articlesFetched: 0,
      articlesStored: 0,
    };
  }
);
