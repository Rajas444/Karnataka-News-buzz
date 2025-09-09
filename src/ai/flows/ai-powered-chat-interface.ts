
'use server';

/**
 * @fileOverview An AI-powered chat interface with speech-to-text and text-to-speech capabilities for drafting article copy or headlines.
 *
 * - aiPoweredChat - A function that handles the AI chat process with voice input and output.
 * - AIPoweredChatInput - The input type for the aiPoweredChat function.
 * - AIPoweredChatOutput - The return type for the aiPoweredChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AIPoweredChatInputSchema = z.object({
  query: z
    .string()
    .describe('The user query for drafting article copy or headlines.'),
});
export type AIPoweredChatInput = z.infer<typeof AIPoweredChatInputSchema>;

const AIPoweredChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
  audio: z.string().describe('The AI-generated audio response in base64 WAV format'),
});
export type AIPoweredChatOutput = z.infer<typeof AIPoweredChatOutputSchema>;

export async function aiPoweredChat(input: AIPoweredChatInput): Promise<AIPoweredChatOutput> {
  return aiPoweredChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredChatPrompt',
  input: {schema: AIPoweredChatInputSchema},
  output: {schema: z.string()},
  prompt: `You are an AI assistant specialized in drafting article copy or headlines based on user queries.

  Respond to the user query with relevant and helpful content.

  Query: {{{query}}}

  Response:`, // Consider adding examples for better guidance.
});

const aiPoweredChatFlow = ai.defineFlow(
  {
    name: 'aiPoweredChatFlow',
    inputSchema: AIPoweredChatInputSchema,
    outputSchema: AIPoweredChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('No text response from the model.');
    }

    const ttsResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: output,
    });

    if (!ttsResponse.media) {
      throw new Error('No media returned from TTS model');
    }

    const audioBuffer = Buffer.from(
      ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      response: output,
      audio: wavBase64,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
