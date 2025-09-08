// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview An AI agent that suggests catchy headlines for news articles.
 *
 * - generateNewsHeadline - A function that generates a headline for a news article.
 * - GenerateNewsHeadlineInput - The input type for the generateNewsHeadline function.
 * - GenerateNewsHeadlineOutput - The return type for the generateNewsHeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsHeadlineInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The content of the news article to generate a headline for.'),
});
export type GenerateNewsHeadlineInput = z.infer<typeof GenerateNewsHeadlineInputSchema>;

const GenerateNewsHeadlineOutputSchema = z.object({
  headline: z.string().describe('The generated catchy headline for the article.'),
});
export type GenerateNewsHeadlineOutput = z.infer<typeof GenerateNewsHeadlineOutputSchema>;

export async function generateNewsHeadline(
  input: GenerateNewsHeadlineInput
): Promise<GenerateNewsHeadlineOutput> {
  return generateNewsHeadlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsHeadlinePrompt',
  input: {schema: GenerateNewsHeadlineInputSchema},
  output: {schema: GenerateNewsHeadlineOutputSchema},
  prompt: `You are an AI assistant specialized in generating catchy headlines for news articles.

  Generate a headline that is engaging and accurately reflects the content of the article below:

  Article Content: {{{articleContent}}}
  `,
});

const generateNewsHeadlineFlow = ai.defineFlow(
  {
    name: 'generateNewsHeadlineFlow',
    inputSchema: GenerateNewsHeadlineInputSchema,
    outputSchema: GenerateNewsHeadlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
