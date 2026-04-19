
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { handleQualityTest, handleTextToSpeech } from '@/app/actions/translate';
import { supportedLanguages, type SupportedLanguage } from '@/lib/languages';
import { ArrowRight, Loader2, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function QualityTester() {
  const [inputText, setInputText] = useState(
    'Intellectual property is a category of property that includes intangible creations of the human intellect.'
  );
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] =
    useState<SupportedLanguage>('Hindi');
  const [isTesting, startTesting] = useTransition();
  const [isSpeaking, startSpeaking] = useTransition();
  const { toast } = useToast();

  const onTestQuality = () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input text is empty',
        description: 'Please enter some text to translate.',
        variant: 'destructive',
      });
      return;
    }
    startTesting(async () => {
      setTranslatedText('');
      const result = await handleQualityTest(inputText, targetLanguage);
      if (result.error) {
        toast({
          title: 'Translation Error',
          description: result.error,
          variant: 'destructive',
        });
        setTranslatedText('Error: Could not translate text.');
      } else {
        setTranslatedText(result.translatedText);
      }
    });
  };

  const playTranslation = () => {
    if (!translatedText || translatedText.startsWith('Error:')) return;

    startSpeaking(async () => {
      const response = await handleTextToSpeech(translatedText);
      if ('error' in response) {
        toast({
          title: 'Speech Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        const audio = new Audio(response.audioDataUri);
        audio.play();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Translation Quality</CardTitle>
        <CardDescription>
          Enter sample English text to check the translation quality for any
          supported language.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          <div className="space-y-2">
            <Label htmlFor="input-text">English Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter English text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="translated-text">Translated Text</Label>
              {translatedText && !translatedText.startsWith('Error:') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-2 text-primary" 
                  onClick={playTranslation}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                  Listen
                </Button>
              )}
            </div>
            <Textarea
              id="translated-text"
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              className="min-h-[150px] resize-none bg-background/50"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <Select
            onValueChange={(value) =>
              setTargetLanguage(value as SupportedLanguage)
            }
            defaultValue={targetLanguage}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onTestQuality}
            disabled={isTesting}
            className="w-full sm:w-auto"
          >
            {isTesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Test Translation
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
