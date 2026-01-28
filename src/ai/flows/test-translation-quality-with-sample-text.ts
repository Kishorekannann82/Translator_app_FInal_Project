// TestTranslationQualityWithSampleText implementation.
'use server';

/**
 * @fileOverview Implements the test translation quality with sample text flow.
 *
 * - testTranslationQuality - A function that handles the translation of sample text.
 * - TestTranslationQualityInput - The input type for the testTranslationQuality function.
 * - TestTranslationQualityOutput - The return type for the testTranslationQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestTranslationQualityInputSchema = z.object({
  text: z.string().describe('The sample text to translate.'),
  language: z.enum(['Hindi', 'Marathi', 'Bengali', 'Gujarati', 'Tamil', 'Telugu']).describe('The target language for translation.'),
});
export type TestTranslationQualityInput = z.infer<typeof TestTranslationQualityInputSchema>;

const TestTranslationQualityOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TestTranslationQualityOutput = z.infer<typeof TestTranslationQualityOutputSchema>;

export async function testTranslationQuality(input: TestTranslationQualityInput): Promise<TestTranslationQualityOutput> {
  return testTranslationQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'testTranslationQualityPrompt',
  input: {schema: TestTranslationQualityInputSchema},
  output: {schema: TestTranslationQualityOutputSchema},
  prompt: `Translate the following text to {{{language}}}. Preserve the true meaning and legal/educational intent of the original English text. Avoid literal or robotic translations. Use simple, formal, and easy-to-understand language. Ensure the output is not colloquial or slang-based. It should be suitable for government communication and public awareness.\n\nText: {{{text}}}`,
});

const testTranslationQualityFlow = ai.defineFlow(
  {
    name: 'testTranslationQualityFlow',
    inputSchema: TestTranslationQualityInputSchema,
    outputSchema: TestTranslationQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
