// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview An AI agent that suggests catchy headlines for news articles.
 *
 * - generateHeadline - A function that generates a headline for a news article.
 * - GenerateHeadlineInput - The input type for the generateHeadline function.
 * - GenerateHeadlineOutput - The return type for the generateHeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeadlineInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The content of the news article to generate a headline for.'),
});
export type GenerateHeadlineInput = z.infer<typeof GenerateHeadlineInputSchema>;

const GenerateHeadlineOutputSchema = z.object({
  headline: z.string().describe('The generated catchy headline for the article.'),
});
export type GenerateHeadlineOutput = z.infer<typeof GenerateHeadlineOutputSchema>;

export async function generateHeadline(
  input: GenerateHeadlineInput
): Promise<GenerateHeadlineOutput> {
  return generateHeadlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHeadlinePrompt',
  input: {schema: GenerateHeadlineInputSchema},
  output: {schema: GenerateHeadlineOutputSchema},
  prompt: `You are an AI assistant specialized in generating catchy headlines for news articles.

  Generate a headline that is engaging and accurately reflects the content of the article below:

  Article Content: {{{articleContent}}}
  `,
});

const generateHeadlineFlow = ai.defineFlow(
  {
    name: 'generateHeadlineFlow',
    inputSchema: GenerateHeadlineInputSchema,
    outputSchema: GenerateHeadlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
