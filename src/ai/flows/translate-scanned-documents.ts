'use server';

/**
 * @fileOverview A flow that translates scanned documents or images containing text into a target language.
 *
 * - translateScannedDocument - A function that handles the translation process.
 * - TranslateScannedDocumentInput - The input type for the translateScannedDocument function.
 * - TranslateScannedDocumentOutput - The return type for the translateScannedDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateScannedDocumentInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A scanned document or image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z
    .string()
    .describe("The target language for translation (e.g., 'Hindi', 'Marathi', 'Bengali', 'Gujarati', 'Tamil', 'Telugu')."),
});
export type TranslateScannedDocumentInput = z.infer<typeof TranslateScannedDocumentInputSchema>;

const TranslateScannedDocumentOutputSchema = z.object({
  translatedText: z.string().describe('The translated text content of the document.'),
});
export type TranslateScannedDocumentOutput = z.infer<typeof TranslateScannedDocumentOutputSchema>;

export async function translateScannedDocument(
  input: TranslateScannedDocumentInput
): Promise<TranslateScannedDocumentOutput> {
  return translateScannedDocumentFlow(input);
}

const translateScannedDocumentPrompt = ai.definePrompt({
  name: 'translateScannedDocumentPrompt',
  input: {schema: TranslateScannedDocumentInputSchema},
  output: {schema: TranslateScannedDocumentOutputSchema},
  prompt: `You are an expert translator specializing in translating documents while preserving the original meaning.

  Translate the text extracted from the scanned document or image into the target language.

  Scanned Document/Image: {{media url=fileDataUri}}
  Target Language: {{{targetLanguage}}}

  Translation:`,
});

const translateScannedDocumentFlow = ai.defineFlow(
  {
    name: 'translateScannedDocumentFlow',
    inputSchema: TranslateScannedDocumentInputSchema,
    outputSchema: TranslateScannedDocumentOutputSchema,
  },
  async input => {
    const {output} = await translateScannedDocumentPrompt(input);
    return output!;
  }
);
