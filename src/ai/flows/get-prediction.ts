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
  predictionText: z.string().describe("The astrological prediction text."),
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
  prompt: `You are an expert astrologer. Using B.V. Raman Ayanamsa, analyze the following birth details and provide major life predictions. Respond ONLY with a valid JSON object matching the output schema. For each key in the JSON, provide the analysis for that section. Do not use any markdown formatting like '*' or '#' in the text.

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
