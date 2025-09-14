
'use server';
/**
 * @fileOverview An AI agent that adds a watermark to an image.
 *
 * - watermarkImage - A function that adds a watermark to an image.
 * - WatermarkImageInput - The input type for the watermarkImage function.
 * - WatermarkImageOutput - The return type for the watermarkImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WatermarkImageInputSchema = z.object({
  imageDataUri: z.string().describe(
    "The image to watermark, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  watermarkText: z.string().describe('The text to use as the watermark.'),
});
export type WatermarkImageInput = z.infer<typeof WatermarkImageInputSchema>;

const WatermarkImageOutputSchema = z.object({
    imageDataUri: z.string().describe('The watermarked image as a data URI.'),
});
export type WatermarkImageOutput = z.infer<typeof WatermarkImageOutputSchema>;

export async function watermarkImage(input: WatermarkImageInput): Promise<WatermarkImageOutput> {
    return watermarkImageFlow(input);
}


const watermarkImageFlow = ai.defineFlow(
  {
    name: 'watermarkImageFlow',
    inputSchema: WatermarkImageInputSchema,
    outputSchema: WatermarkImageOutputSchema,
  },
  async ({ imageDataUri, watermarkText }) => {
    
    // Use an image-to-image model to "draw" the watermark.
    // This is more reliable in environments where canvas/native libraries are not available.
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: imageDataUri } },
            { text: `Overlay the following text as a semi-transparent watermark on the bottom-right corner of this image: "${watermarkText}"` },
        ],
        config: {
            responseModalities: ['IMAGE'],
        },
    });

    if (!media?.url) {
        // If the AI fails, return the original image to avoid breaking the upload process.
        console.warn("Watermarking failed. Returning original image.");
        return { imageDataUri };
    }

    return { imageDataUri: media.url };
  }
);
