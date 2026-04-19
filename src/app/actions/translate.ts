
'use server';

import {
  translateTextAndPreserveFormatting,
} from '@/ai/flows/translate-text-and-preserve-formatting';
import {
  translateScannedDocument,
} from '@/ai/flows/translate-scanned-documents';
import {
  testTranslationQuality,
} from '@/ai/flows/test-translation-quality-with-sample-text';
import {
  translateAudio,
} from '@/ai/flows/translate-audio';
import {
  textToSpeech,
} from '@/ai/flows/text-to-speech';
import { z } from 'zod';
import { supportedLanguages } from '@/lib/languages';

const LanguageSchema = z.enum(supportedLanguages.map(l => l.value) as [string, ...string[]]);

type ActionResult = Promise<{ translatedText: string } | { error: string }>;

export async function handleTextTranslation(
  text: string,
  targetLanguage: string
): ActionResult {
  try {
    const validatedLanguage = LanguageSchema.parse(targetLanguage);
    const result = await translateTextAndPreserveFormatting({
      text,
      sourceLanguage: 'English',
      targetLanguage: validatedLanguage,
    });
    return { translatedText: result.translatedText };
  } catch (e) {
    console.error('Text translation failed:', e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred during translation.';
    return { error: message };
  }
}

export async function handleDocumentTranslation(
  fileDataUri: string,
  targetLanguage: string
): ActionResult {
  try {
    const validatedLanguage = LanguageSchema.parse(targetLanguage);
    const result = await translateScannedDocument({
      fileDataUri,
      targetLanguage: validatedLanguage,
    });
    return { translatedText: result.translatedText };
  } catch (e) {
    console.error('Document translation failed:', e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred during document processing.';
    return { error: message };
  }
}

export async function handleQualityTest(
  text: string,
  language: string
): ActionResult {
  try {
    const validatedLanguage = LanguageSchema.parse(language);
    const result = await testTranslationQuality({
      text,
      language: validatedLanguage,
    });
    return { translatedText: result.translatedText };
  } catch (e) {
    console.error('Quality test failed:', e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred during the quality test.';
    return { error: message };
  }
}

export async function handleAudioTranslation(
  audioDataUri: string,
  targetLanguage: string
): Promise<{ translatedText: string; originalTranscript: string } | { error: string }> {
  try {
    const validatedLanguage = LanguageSchema.parse(targetLanguage);
    const result = await translateAudio({
      audioDataUri,
      targetLanguage: validatedLanguage,
    });
    return result;
  } catch (e) {
    console.error('Audio translation failed:', e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred during audio processing.';
    return { error: message };
  }
}

export async function handleTextToSpeech(text: string): Promise<{ audioDataUri: string } | { error: string }> {
  try {
    const result = await textToSpeech({ text });
    return result;
  } catch (e) {
    console.error('TTS failed:', e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred during speech generation.';
    return { error: message };
  }
}
