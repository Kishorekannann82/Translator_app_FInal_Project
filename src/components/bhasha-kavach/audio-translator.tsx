
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
import { handleAudioTranslation, handleTextToSpeech, handleSummarize } from '@/app/actions/translate';
import { Mic, Square, Loader2, RotateCcw, Volume2, Languages, Sparkles, Download, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AudioTranslator() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('Hindi');
  const [isTranslating, startTranslation] = useTransition();
  const [isSpeaking, startSpeaking] = useTransition();
  const [isSummarizing, startSummarizing] = useTransition();
  const [result, setResult] = useState<{
    translatedText: string;
    originalTranscript: string;
    summary?: string;
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

  const onSummarize = () => {
    if (!result?.translatedText) return;
    startSummarizing(async () => {
      const response = await handleSummarize(result.translatedText);
      if ('error' in response) {
        toast({ title: 'Summarization failed', description: response.error, variant: 'destructive' });
      } else {
        setResult(prev => prev ? { ...prev, summary: response.summary } : null);
        toast({ title: 'Summary Generated', description: 'AI has summarized the voice translation.' });
      }
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

  const downloadResult = () => {
    if (!result) return;
    const content = `Original Transcript:\n${result.originalTranscript}\n\nTranslated (${targetLanguage}):\n${result.translatedText}\n\nSummary:\n${result.summary || 'N/A'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice_translation_${targetLanguage}.txt`;
    a.click();
  };

  return (
    <Card className="w-full border-accent/20 shadow-xl">
      <CardHeader className="bg-accent/5 pb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileAudio className="h-6 w-6 text-accent" />
              Voice Translation Studio
            </CardTitle>
            <CardDescription>
              Multimodal AI transcribes English speech and converts it to your chosen regional dialect.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-accent/30 text-accent">Real-time Audio</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border-2 border-dashed border-accent/20 bg-accent/5 p-12">
          <div
            className={cn(
              'flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500 shadow-lg',
              isRecording
                ? 'animate-pulse bg-destructive shadow-destructive/50 ring-8 ring-destructive/20'
                : audioBlob
                ? 'bg-green-500 shadow-green-200'
                : 'bg-accent shadow-accent/30'
            )}
          >
            {isRecording ? (
              <Square className="h-10 w-10 text-white fill-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">
              {isRecording
                ? 'Listening to your speech...'
                : audioBlob
                ? 'Audio Ready for Translation'
                : 'Ready to Record'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRecording ? 'Click the red button to stop' : 'Press start and speak clearly in English'}
            </p>
            {audioUrl && (
              <audio src={audioUrl} controls className="mt-4 h-11 w-full max-w-sm rounded-full bg-white shadow-sm" />
            )}
          </div>

          <div className="flex gap-4">
            {!isRecording && !audioBlob && (
              <Button onClick={startRecording} size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-lg shadow-accent/20">
                <Mic className="mr-3 h-6 w-6" />
                Start Recording
              </Button>
            )}
            {isRecording && (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-lg shadow-destructive/20">
                <Square className="mr-3 h-5 w-5 fill-current" />
                Stop
              </Button>
            )}
            {audioBlob && !isTranslating && (
              <Button onClick={resetRecording} variant="outline" size="lg" className="rounded-full px-10 h-14 font-bold border-accent/20 hover:bg-accent/5">
                <RotateCcw className="mr-3 h-5 w-5" />
                Discard & Retry
              </Button>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Original English</h4>
                  <Badge variant="secondary">Transcript</Badge>
                </div>
                <div className="rounded-xl border bg-slate-50 p-5 text-sm leading-relaxed shadow-sm min-h-[120px]">
                  {result.originalTranscript}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wider">Regional Translation</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-accent">{targetLanguage}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-accent hover:bg-accent/10" 
                      onClick={playTranslation}
                      disabled={isSpeaking}
                    >
                      {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-accent/20 bg-white p-5 text-sm font-medium leading-relaxed shadow-sm min-h-[120px]">
                  {result.translatedText}
                </div>
              </div>
            </div>

            {result.summary && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-5 space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-bold text-orange-700 uppercase">
                  <Sparkles className="h-4 w-4" /> AI Key Insights
                </h4>
                <p className="text-sm italic text-slate-700 leading-relaxed">{result.summary}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t">
               {!result.summary && (
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                    onClick={onSummarize}
                    disabled={isSummarizing}
                  >
                    {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Summarize Output
                  </Button>
               )}
               <Button variant="outline" className="gap-2 border-slate-200" onClick={downloadResult}>
                <Download className="h-4 w-4" /> Export Report
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
               <Languages className="h-6 w-6" />
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-muted-foreground uppercase">Target Language</span>
               <Select
                  onValueChange={(value) => setTargetLanguage(value as SupportedLanguage)}
                  defaultValue={targetLanguage}
                >
                  <SelectTrigger className="w-[200px] font-semibold border-accent/20">
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
          </div>
          
          <Button 
            onClick={translateAudio} 
            disabled={!audioBlob || isTranslating || isRecording}
            className="w-full sm:w-auto h-14 px-12 rounded-xl text-lg font-bold shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Analyzing Speech...
              </>
            ) : (
              <>
                <Languages className="mr-3 h-6 w-6" />
                Translate Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
