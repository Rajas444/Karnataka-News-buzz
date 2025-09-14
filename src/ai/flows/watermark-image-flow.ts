
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
import { createCanvas, loadImage } from 'canvas';

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
    
    const image = await loadImage(imageDataUri);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the original image
    ctx.drawImage(image, 0, 0);

    // Prepare watermark text
    const fontSize = Math.max(12, Math.min(image.width / 20, image.height / 15));
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // Add a slight shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw text at top-right corner
    ctx.fillText(watermarkText, canvas.width - 10, 10);
    
    // Also draw at bottom-left corner for good measure
    ctx.textAlign = 'left';
    ctx.fillText(watermarkText, 10, canvas.height - fontSize - 10);

    const watermarkedImage = canvas.toDataURL(imageDataUri.split(';')[0].split(':')[1]);

    return { imageDataUri: watermarkedImage };
  }
);
