
'use server';
/**
 * @fileOverview An AI agent that extracts the main content of a news article from a URL.
 *
 * - extractArticleContent - A function that fetches and parses an article URL.
 * - ExtractArticleContentInput - The input type for the function.
 * - ExtractArticleContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractArticleContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the news article to process.'),
});
export type ExtractArticleContentInput = z.infer<typeof ExtractArticleContentInputSchema>;

const ExtractArticleContentOutputSchema = z.object({
  content: z.string().describe('The full, clean, and reader-friendly main content of the article, formatted in Markdown.'),
});
export type ExtractArticleContentOutput = z.infer<typeof ExtractArticleContentOutputSchema>;


export async function extractArticleContent(input: ExtractArticleContentInput): Promise<ExtractArticleContentOutput> {
  return extractArticleContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractArticleContentPrompt',
  input: {schema: ExtractArticleContentInputSchema},
  output: {schema: ExtractArticleContentOutputSchema},
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

const extractArticleContentFlow = ai.defineFlow(
  {
    name: 'extractArticleContentFlow',
    inputSchema: ExtractArticleContentInputSchema,
    outputSchema: ExtractArticleContentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
