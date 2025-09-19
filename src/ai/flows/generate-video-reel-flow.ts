
'use server';
/**
 * @fileOverview An AI agent that generates a video reel from news content.
 *
 * - generateVideoReel - A function that creates a video from a title and summary.
 * - GenerateVideoReelInput - The input type for the function.
 * - GenerateVideoReelOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import type { MediaPart } from 'genkit';


const GenerateVideoReelInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  summary: z.string().describe('A short summary of the news article.'),
});
export type GenerateVideoReelInput = z.infer<typeof GenerateVideoReelInputSchema>;

const GenerateVideoReelOutputSchema = z.object({
  videoDataUri: z.string().optional().describe('The generated video as a data URI.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateVideoReelOutput = z.infer<typeof GenerateVideoReelOutputSchema>;

export async function generateVideoReel(input: GenerateVideoReelInput): Promise<GenerateVideoReelOutput> {
  return generateVideoReelFlow(input);
}

const generateVideoReelFlow = ai.defineFlow(
  {
    name: 'generateVideoReelFlow',
    inputSchema: GenerateVideoReelInputSchema,
    outputSchema: GenerateVideoReelOutputSchema,
  },
  async ({ title, summary }) => {
    try {
      let { operation } = await ai.generate({
        model: googleAI.model('veo-3.0-generate-preview'),
        prompt: `Create a dynamic, engaging, professional news-style video for a vertical phone screen (9:16 aspect ratio). The video should be visually compelling and suitable for a news reel. Incorporate the following story details: Title: "${title}". Summary: "${summary}"`,
        config: {
            aspectRatio: '9:16',
        }
      });

      if (!operation) {
        throw new Error('Expected the model to return an operation for video generation.');
      }

      // Poll for completion
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds
        operation = await ai.checkOperation(operation);
      }

      if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
      }

      const videoPart = operation.output?.message?.content.find((p) => p.media && p.media.contentType?.startsWith('video/'));
      
      if (!videoPart || !videoPart.media?.url) {
        throw new Error('The model did not return a valid video. This may be due to a rate limit or API issue.');
      }
      
      // The URL from Veo is temporary and needs the API key to be accessed.
      const videoUrlWithKey = `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`;
      
      // Fetch the video content and convert it to a data URI
      const response = await fetch(videoUrlWithKey);
      if (!response.ok) {
          throw new Error(`Failed to download generated video. Status: ${response.status}`);
      }
      const videoBuffer = await response.arrayBuffer();
      const videoBase64 = Buffer.from(videoBuffer).toString('base64');
      const videoDataUri = `data:${videoPart.media.contentType || 'video/mp4'};base64,${videoBase64}`;

      return {
        videoDataUri,
      };

    } catch (e: any) {
        console.error("[generateVideoReelFlow] Error:", e);
        return { error: e.message || 'An unknown error occurred.' };
    }
  }
);
