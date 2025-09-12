
'use server';

/**
 * @fileOverview An AI chat interface for news, events, and districts.
 *
 * - aiChat - A function that handles the AI chat process.
 * - AIChatInput - The input type for the aiChat function.
 * - AIChatOutput - The return type for the aiChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatInputSchema = z.object({
  query: z.string().describe('The user query about news, events, or districts.'),
});
export type AIChatInput = z.infer<typeof AIChatInputSchema>;

const RelatedArticleSchema = z.object({
    title: z.string().describe('The title of the related article.'),
    url: z.string().url().describe('The URL of the related article.'),
});

const AIChatOutputSchema = z.object({
  summary: z.string().describe('A summary of the information requested.'),
  relatedArticles: z.array(RelatedArticleSchema).describe('A list of related articles with their titles and URLs.'),
});
export type AIChatOutput = z.infer<typeof AIChatOutputSchema>;

export async function aiChat(input: AIChatInput): Promise<AIChatOutput> {
  return aiChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatPrompt',
  input: {schema: AIChatInputSchema},
  output: {schema: z.object({ summary: z.string(), relatedArticles: z.array(RelatedArticleSchema).optional() })},
  prompt: `You are a helpful AI news assistant for the Karnataka News Pulse website.

Your goal is to answer user questions about news, current events, or any other general queries they may have.

If the user asks a question about a news topic, provide a helpful summary. You may also suggest up to 3 related articles, providing both their title and their direct URL.
If the user asks a general question, provide a helpful response.
If a query is unclear or outside your scope as a news assistant, you can politely say so.

User Query: {{{query}}}
`,
});

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AIChatInputSchema,
    outputSchema: AIChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Add a fallback for the case where the model doesn't generate related articles.
    return { summary: output!.summary, relatedArticles: output!.relatedArticles || [] };
  }
);
