
'use server';
/**
 * @fileOverview An AI agent that generates an image from news content.
 *
 * - generateNewsImage - A function that creates an image from a title and summary.
 * - GenerateNewsImageInput - The input type for the function.
 * - GenerateNewsImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const GenerateNewsImageInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  summary: z.string().describe('A short summary of the news article.'),
});
export type GenerateNewsImageInput = z.infer<typeof GenerateNewsImageInputSchema>;

const GenerateNewsImageOutputSchema = z.object({
  imageDataUri: z.string().optional().describe('The generated image as a data URI.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateNewsImageOutput = z.infer<typeof GenerateNewsImageOutputSchema>;

export async function generateNewsImage(input: GenerateNewsImageInput): Promise<GenerateNewsImageOutput> {
  return generateNewsImageFlow(input);
}

const generateNewsImageFlow = ai.defineFlow(
  {
    name: 'generateNewsImageFlow',
    inputSchema: GenerateNewsImageInputSchema,
    outputSchema: GenerateNewsImageOutputSchema,
  },
  async ({ title, summary }) => {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: `Create a dynamic, engaging, professional news-style graphic for a vertical phone screen (9:16 aspect ratio). The image should be visually compelling and suitable for a news reel. Incorporate the following story details: Title: "${title}". Summary: "${summary}"`,
      });

      if (!media?.url) {
        throw new Error('The model did not return an image. This may be due to a rate limit or API issue.');
      }

      return {
        imageDataUri: media.url,
      };

    } catch (e: any) {
        console.error("[generateNewsImageFlow] Error:", e);
        return { error: e.message || 'An unknown error occurred.' };
    }
  }
);
