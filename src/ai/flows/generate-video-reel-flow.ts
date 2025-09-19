
'use server';
/**
 * @fileOverview An AI agent that generates a short video reel from news content.
 *
 * - generateVideoReel - A function that creates a video from a title and summary.
 * - GenerateVideoReelInput - The input type for the function.
 * - GenerateVideoReelOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

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

// Increase the timeout for this server action as video generation can be slow.
export const maxDuration = 120; // 2 minutes

const generateVideoReelFlow = ai.defineFlow(
  {
    name: 'generateVideoReelFlow',
    inputSchema: GenerateVideoReelInputSchema,
    outputSchema: GenerateVideoReelOutputSchema,
  },
  async ({ title, summary }) => {
    try {
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: `Create a dynamic, engaging news-style video reel about the following story. Use cinematic shots and professional news graphics. Title: "${title}". Summary: "${summary}"`,
        config: {
          durationSeconds: 8,
          aspectRatio: '9:16',
        },
      });

      if (!operation) {
        throw new Error('The model did not return an operation. This may be due to a rate limit or API issue.');
      }

      // Poll for completion
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
      }

      if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
      }

      const video = operation.output?.message?.content.find((p) => !!p.media);
      if (!video || !video.media?.url) {
        throw new Error('No video was found in the operation result.');
      }

      // The URL from Veo is temporary. We need to fetch it and convert to a data URI to send to the client.
      // This requires node-fetch or a similar library.
      const fetch = (await import('node-fetch')).default;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set.');
      }
      
      const videoDownloadResponse = await fetch(
        `${video.media.url}&key=${apiKey}`
      );

      if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error(`Failed to download the generated video. Status: ${videoDownloadResponse.status}`);
      }
      
      const videoBuffer = await videoDownloadResponse.arrayBuffer();
      const videoBase64 = Buffer.from(videoBuffer).toString('base64');

      return {
        videoDataUri: `data:video/mp4;base64,${videoBase64}`,
      };

    } catch (e: any) {
        console.error("[generateVideoReelFlow] Error:", e);
        return { error: e.message || 'An unknown error occurred.' };
    }
  }
);
