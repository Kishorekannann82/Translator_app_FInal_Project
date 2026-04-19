
import { config } from 'dotenv';
config();

import '@/ai/flows/translate-scanned-documents.ts';
import '@/ai/flows/translate-text-and-preserve-formatting.ts';
import '@/ai/flows/test-translation-quality-with-sample-text.ts';
import '@/ai/flows/translate-audio.ts';
import '@/ai/flows/text-to-speech.ts';
