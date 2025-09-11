
'use server';
/**
 * @fileOverview An AI agent that translates news articles.
 *
 * - translateArticle - A function that translates an article's title and content.
 * - TranslateArticleInput - The input type for the translateArticle function.
 * - TranslateArticleOutput - The return type for the translateArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateArticleInputSchema = z.object({
  title: z.string().describe('The title of the article to translate.'),
  content: z.string().describe('The content of the article to translate.'),
  targetLanguage: z.string().describe('The language to translate the article into (e.g., "English").'),
});
export type TranslateArticleInput = z.infer<typeof TranslateArticleInputSchema>;

const TranslateArticleOutputSchema = z.object({
  title: z.string().describe('The translated title of the article.'),
  content: z.string().describe('The translated content of the article.'),
});
export type TranslateArticleOutput = z.infer<typeof TranslateArticleOutputSchema>;

export async function translateArticle(input: TranslateArticleInput): Promise<TranslateArticleOutput> {
  return translateArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateArticlePrompt',
  input: {schema: TranslateArticleInputSchema},
  output: {schema: TranslateArticleOutputSchema},
  prompt: `You are an expert translator. Translate the following news article title and content into {{targetLanguage}}.
  
  Do not add any commentary or preamble. Provide only the translated title and content in the specified JSON format.

  Title:
  {{{title}}}

  Content:
  {{{content}}}
  `,
});

const translateArticleFlow = ai.defineFlow(
  {
    name: 'translateArticleFlow',
    inputSchema: TranslateArticleInputSchema,
    outputSchema: TranslateArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
