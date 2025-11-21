
'use server';
/**
 * @fileOverview A flow for generating astrological predictions.
 *
 * - getPrediction - A function that generates a prediction based on birth details.
 * - GetPredictionInput - The input type for the getPrediction function.
 * - GetPredictionOutput - The return type for the getPrediction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetPredictionInputSchema = z.object({
  name: z.string().describe("The user's name."),
  birthDate: z.string().describe("The user's birth date in YYYY-MM-DD format."),
  birthTime: z.string().describe("The user's birth time in HH:MM format."),
  birthCity: z.string().describe("The user's birth city."),
});
export type GetPredictionInput = z.infer<typeof GetPredictionInputSchema>;

const GetPredictionOutputSchema = z.object({
  introduction: z.string().describe("An introduction to the astrological reading."),
  major_life_events: z.string().describe("Predictions about major life events."),
  health: z.string().describe("Predictions related to health."),
  wealth: z.string().describe("Predictions related to wealth and finance."),
  career: z.string().describe("Predictions related to career and professional life."),
  relationships: z.string().describe("Predictions related to personal relationships."),
  conclusion: z.string().describe("A concluding summary of the reading."),
});
export type GetPredictionOutput = z.infer<typeof GetPredictionOutputSchema>;

export async function getPrediction(
  input: GetPredictionInput
): Promise<GetPredictionOutput> {
  return getPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPredictionPrompt',
  input: { schema: GetPredictionInputSchema },
  output: { schema: GetPredictionOutputSchema },
  prompt: `You are an expert astrologer. Your analysis MUST strictly use the B.V. Raman Ayanamsa system ONLY. Analyze the following birth details and provide major life predictions. For EVERY section of the prediction (introduction, major_life_events, health, wealth, career, relationships), you MUST include specific dates, date ranges, or general timelines (e.g., "in your late twenties", "around June 2025"). Respond ONLY with a valid JSON object matching the output schema. Do not use any markdown formatting like '*' or '#' in the text.

Name: {{{name}}}
Birth Date: {{{birthDate}}}
Birth Time: {{{birthTime}}}
Birth City: {{{birthCity}}}`,
});

const getPredictionFlow = ai.defineFlow(
  {
    name: 'getPredictionFlow',
    inputSchema: GetPredictionInputSchema,
    outputSchema: GetPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
