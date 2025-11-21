'use server';
/**
 * @fileoverview A flow for handling conversational chat with an AI.
 *
 * - chat - A function that takes conversation history and a new message, and returns the AI's response.
 */

import { ai } from '@/ai/genkit';
import { Message, Part } from 'genkit';
import { z } from 'zod';

// Define the schema for the flow's input
const ChatInputSchema = z.object({
  history: z.array(z.custom<Message>()),
  message: z.string(),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

// Define the schema for the flow's output
const ChatOutputSchema = z.string();
type ChatOutput = z.infer<typeof ChatOutputSchema>;

// The main chat function that will be exported
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

// Define the Genkit flow
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { history, message } = input;

    const systemPrompt = `You are an expert astrologer answering follow-up questions. Your response MUST follow these rules:
1.  Provide direct answers based on the user's birth chart from the history.
2.  Always include specific, approximate dates or timelines (e.g., "around June 2025", "in your late twenties").
3.  Keep your entire response to a maximum of three sentences.
4.  Do NOT use any astrological jargon like "7th house lord", "Dasha", "transits", or "aspects".`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      history: history,
      prompt: message,
    });

    return response.text;
  }
);
