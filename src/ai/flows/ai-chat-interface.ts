
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

const AIChatOutputSchema = z.object({
  summary: z.string().describe('A summary of the information requested.'),
  relatedArticles: z.array(z.string()).describe('A list of related article titles.'),
});
export type AIChatOutput = z.infer<typeof AIChatOutputSchema>;

export async function aiChat(input: AIChatInput): Promise<AIChatOutput> {
  return aiChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatPrompt',
  input: {schema: AIChatInputSchema},
  output: {schema: AIChatOutputSchema},
  prompt: `You are an AI assistant providing information about Karnataka news, events, and districts.

  Respond to the user query with a concise summary and suggest related article titles.

  Query: {{{query}}}

  Summary:
  Related Articles:`, // Consider adding examples for better guidance.
});

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AIChatInputSchema,
    outputSchema: AIChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
