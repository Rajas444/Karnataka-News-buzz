
'use server';
/**
 * @fileOverview An AI agent that extracts the main content of a news article from a URL.
 *
 * - extractArticleContentFromUrl - A function that fetches and parses an article URL.
 * - ExtractArticleContentFromUrlInput - The input type for the function.
 * - ExtractArticleContentFromUrlOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractArticleContentFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the news article to process.'),
});
export type ExtractArticleContentFromUrlInput = z.infer<typeof ExtractArticleContentFromUrlInputSchema>;

const ExtractArticleContentFromUrlOutputSchema = z.object({
  content: z.string().describe('The full, clean, and reader-friendly main content of the article, formatted in Markdown.'),
});
export type ExtractArticleContentFromUrlOutput = z.infer<typeof ExtractArticleContentFromUrlOutputSchema>;


export async function extractArticleContentFromUrl(input: ExtractArticleContentFromUrlInput): Promise<ExtractArticleContentFromUrlOutput> {
  return extractArticleContentFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractArticleContentFromUrlPrompt',
  input: {schema: ExtractArticleContentFromUrlInputSchema},
  output: {schema: ExtractArticleContentFromUrlOutputSchema},
  prompt: `You are an expert at web scraping and content extraction. Your task is to extract the main article content from the provided URL.
  
  Instructions:
  1. Fetch the content from the URL: {{{url}}}
  2. Identify and extract only the main body of the article.
  3. Exclude all non-essential elements such as ads, navigation menus, sidebars, footers, related articles links, and social media sharing buttons.
  4. Clean the extracted content, removing any leftover HTML tags or scripts.
  5. Format the final text in simple Markdown for readability (e.g., using ### for subheadings and new lines for paragraphs).
  6. Return only the cleaned and formatted article content. Do not add any commentary.
  `,
});

const extractArticleContentFromUrlFlow = ai.defineFlow(
  {
    name: 'extractArticleContentFromUrlFlow',
    inputSchema: ExtractArticleContentFromUrlInputSchema,
    outputSchema: ExtractArticleContentFromUrlOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
