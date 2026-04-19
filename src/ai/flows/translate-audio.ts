'use server';

/**
 * @fileOverview A flow that translates spoken audio into a target language.
 *
 * - translateAudio - A function that handles the audio translation process.
 * - TranslateAudioInput - The input type for the translateAudio function.
 * - TranslateAudioOutput - The return type for the translateAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z
    .string()
    .describe("The target language for translation (e.g., 'Hindi', 'Marathi', 'Bengali', 'Gujarati', 'Tamil', 'Telugu')."),
});
export type TranslateAudioInput = z.infer<typeof TranslateAudioInputSchema>;

const TranslateAudioOutputSchema = z.object({
  translatedText: z.string().describe('The translated text content of the speech found in the audio.'),
  originalTranscript: z.string().describe('The transcript of the original speech in English.'),
});
export type TranslateAudioOutput = z.infer<typeof TranslateAudioOutputSchema>;

export async function translateAudio(
  input: TranslateAudioInput
): Promise<TranslateAudioOutput> {
  return translateAudioFlow(input);
}

const translateAudioPrompt = ai.definePrompt({
  name: 'translateAudioPrompt',
  input: {schema: TranslateAudioInputSchema},
  output: {schema: TranslateAudioOutputSchema},
  prompt: `You are an expert translator and speech recognition specialist.

Listen to the provided audio recording. 
1. Transcribe the speech content (which is expected to be in English related to Intellectual Property Rights awareness).
2. Translate that transcript into the target language: {{{targetLanguage}}}.

Provide both the original transcript and the translated text.

Audio: {{media url=audioDataUri}}
Target Language: {{{targetLanguage}}}`,
});

const translateAudioFlow = ai.defineFlow(
  {
    name: 'translateAudioFlow',
    inputSchema: TranslateAudioInputSchema,
    outputSchema: TranslateAudioOutputSchema,
  },
  async input => {
    const {output} = await translateAudioPrompt(input);
    return output!;
  }
);
