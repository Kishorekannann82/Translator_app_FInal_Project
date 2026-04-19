
'use client';

import React, { useState, useRef, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supportedLanguages, type SupportedLanguage } from '@/lib/languages';
import { handleAudioTranslation, handleTextToSpeech } from '@/app/actions/translate';
import { Mic, Square, Loader2, RotateCcw, Volume2, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AudioTranslator() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('Hindi');
  const [isTranslating, startTranslation] = useTransition();
  const [isSpeaking, startSpeaking] = useTransition();
  const [result, setResult] = useState<{
    translatedText: string;
    originalTranscript: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Microphone Error',
        description: 'Could not access your microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
  };

  const translateAudio = () => {
    if (!audioBlob) return;

    startTranslation(async () => {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const response = await handleAudioTranslation(base64Audio, targetLanguage);

        if ('error' in response) {
          toast({
            title: 'Translation Error',
            description: response.error,
            variant: 'destructive',
          });
        } else {
          setResult(response);
          toast({
            title: 'Translation Complete',
            description: 'Your audio has been translated successfully.',
          });
        }
      };
    });
  };

  const playTranslation = () => {
    if (!result?.translatedText) return;

    startSpeaking(async () => {
      const response = await handleTextToSpeech(result.translatedText);
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Audio Translation
        </CardTitle>
        <CardDescription>
          Record your speech in English to get an instant translation in your target language.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border bg-muted/30 p-8">
          <div
            className={cn(
              'flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300',
              isRecording
                ? 'animate-pulse bg-destructive shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : audioBlob
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-primary/10'
            )}
          >
            {isRecording ? (
              <Square className="h-10 w-10 text-white" />
            ) : (
              <Mic className={cn('h-10 w-10', audioBlob ? 'text-green-600' : 'text-primary')} />
            )}
          </div>

          <div className="text-center">
            <p className="font-medium">
              {isRecording
                ? 'Recording... Speak now'
                : audioBlob
                ? 'Recording Complete'
                : 'Ready to record'}
            </p>
            {audioUrl && (
              <audio src={audioUrl} controls className="mt-4 h-10 w-full max-w-xs" />
            )}
          </div>

          <div className="flex gap-4">
            {!isRecording && !audioBlob && (
              <Button onClick={startRecording} size="lg" className="rounded-full px-8">
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            )}
            {isRecording && (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full px-8">
                <Square className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            )}
            {audioBlob && !isTranslating && (
              <Button onClick={resetRecording} variant="outline" size="lg" className="rounded-full px-8">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Original Transcript</h4>
                <Badge variant="outline">English</Badge>
              </div>
              <div className="rounded-lg border bg-background p-4 text-sm leading-relaxed shadow-sm">
                {result.originalTranscript}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Translated Text</h4>
                <div className="flex items-center gap-2">
                  <Badge>{targetLanguage}</Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary" 
                    onClick={playTranslation}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm font-medium leading-relaxed shadow-sm">
                {result.translatedText}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium">Target Language:</span>
             <Select
                onValueChange={(value) => setTargetLanguage(value as SupportedLanguage)}
                defaultValue={targetLanguage}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>
          
          <Button 
            onClick={translateAudio} 
            disabled={!audioBlob || isTranslating || isRecording}
            className="w-full sm:w-auto"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Translate Recording
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
