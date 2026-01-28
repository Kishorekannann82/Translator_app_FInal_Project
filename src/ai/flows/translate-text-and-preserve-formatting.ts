'use server';
/**
 * @fileOverview A flow for translating text while preserving formatting.
 *
 * - translateTextAndPreserveFormatting - A function that handles the translation process.
 * - TranslateTextAndPreserveFormattingInput - The input type for the translateTextAndPreserveFormatting function.
 * - TranslateTextAndPreserveFormattingOutput - The return type for the translateTextAndPreserveFormatting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextAndPreserveFormattingInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  sourceLanguage: z.string().describe('The language of the input text (e.g., en for English).'),
  targetLanguage: z.string().describe('The desired language for the output text (e.g., hi for Hindi).'),
});

export type TranslateTextAndPreserveFormattingInput = z.infer<typeof TranslateTextAndPreserveFormattingInputSchema>;

const TranslateTextAndPreserveFormattingOutputSchema = z.object({
  translatedText: z.string().describe('The translated text, with formatting preserved as much as possible.'),
});

export type TranslateTextAndPreserveFormattingOutput = z.infer<typeof TranslateTextAndPreserveFormattingOutputSchema>;

export async function translateTextAndPreserveFormatting(
  input: TranslateTextAndPreserveFormattingInput
): Promise<TranslateTextAndPreserveFormattingOutput> {
  return translateTextAndPreserveFormattingFlow(input);
}

const translateTextAndPreserveFormattingPrompt = ai.definePrompt({
  name: 'translateTextAndPreserveFormattingPrompt',
  input: {schema: TranslateTextAndPreserveFormattingInputSchema},
  output: {schema: TranslateTextAndPreserveFormattingOutputSchema},
  prompt: `You are a professional translator who specializes in preserving the original formatting of documents.

Translate the following text from {{sourceLanguage}} to {{targetLanguage}}.  Attempt to preserve as much of the original formatting as possible. Return only the translated text.

{{text}}`,
});

const translateTextAndPreserveFormattingFlow = ai.defineFlow(
  {
    name: 'translateTextAndPreserveFormattingFlow',
    inputSchema: TranslateTextAndPreserveFormattingInputSchema,
    outputSchema: TranslateTextAndPreserveFormattingOutputSchema,
  },
  async input => {
    const {output} = await translateTextAndPreserveFormattingPrompt(input);
    return output!;
  }
);
