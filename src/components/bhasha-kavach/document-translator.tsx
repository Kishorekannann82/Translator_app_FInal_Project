'use client';

import React, { useState, useTransition, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supportedLanguages, type SupportedLanguage } from '@/lib/languages';
import {
  handleTextTranslation,
  handleDocumentTranslation,
  handleTextToSpeech,
  handleSummarize,
} from '@/app/actions/translate';
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  Download,
  Languages,
  Volume2,
  Sparkles,
  FileText,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import { getFileIcon } from './icons';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type FileStatus = 'pending' | 'uploading' | 'translating' | 'done' | 'error';

interface FileState {
  id: string;
  file: File | { name: string; size: number; type: string };
  status: FileStatus;
  progress: number;
  translatedText: string | null;
  summary: string | null;
  audioUri: string | null;
  error: string | null;
  isCustomText?: boolean;
  content?: string;
}

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

interface DocumentTranslatorProps {
  initialText?: string;
  onClearInitialText?: () => void;
}

export default function DocumentTranslator({ initialText, onClearInitialText }: DocumentTranslatorProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('Hindi');
  const [isTranslating, startTranslation] = useTransition();
  const [isSpeaking, startSpeaking] = useTransition();
  const [isSummarizing, startSummarizing] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialText) {
      const newId = `repo-${Date.now()}`;
      setFiles([{
        id: newId,
        file: { name: 'Repository Resource', size: initialText.length, type: 'text/plain' },
        status: 'pending',
        progress: 0,
        translatedText: null,
        summary: null,
        audioUri: null,
        error: null,
        isCustomText: true,
        content: initialText
      }]);
      setActiveTab(newId);
      onClearInitialText?.();
    }
  }, [initialText, onClearInitialText]);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const newFileStates = Array.from(newFiles).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      status: 'pending' as FileStatus,
      progress: 0,
      translatedText: null,
      summary: null,
      audioUri: null,
      error: null,
    }));
    setFiles((prev) => [...prev, ...newFileStates]);
  };

  const updateFileState = (id: string, update: Partial<FileState>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...update } : f))
    );
  };

  const onTranslate = () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please upload at least one document or select a resource.',
        variant: 'destructive',
      });
      return;
    }

    startTranslation(async () => {
      const translationPromises = files
        .filter((f) => f.status !== 'done')
        .map(async (fileState) => {
          try {
            updateFileState(fileState.id, { status: 'uploading', progress: 25 });
            let result: { translatedText: string } | { error: string };

            if (fileState.isCustomText && fileState.content) {
              updateFileState(fileState.id, { status: 'translating', progress: 50 });
              result = await handleTextTranslation(fileState.content, targetLanguage);
            } else {
              const file = fileState.file as File;
              const fileType = file.type;
              if (fileType.startsWith('text/') || file.name.endsWith('.txt')) {
                const text = await readFileAsText(file);
                updateFileState(fileState.id, { status: 'translating', progress: 50 });
                result = await handleTextTranslation(text, targetLanguage);
              } else {
                const dataUrl = await readFileAsDataURL(file);
                updateFileState(fileState.id, { status: 'translating', progress: 50 });
                result = await handleDocumentTranslation(dataUrl, targetLanguage);
              }
            }

            if ('error' in result) throw new Error(result.error);
            
            updateFileState(fileState.id, {
              status: 'done',
              progress: 100,
              translatedText: result.translatedText,
            });
            
            if (db && user) {
              const jobsRef = collection(db, 'users', user.uid, 'translationJobs');
              addDocumentNonBlocking(jobsRef, {
                userId: user.uid,
                originalFileName: fileState.file.name,
                originalFileType: fileState.file.type,
                inputMethod: fileState.isCustomText ? 'repository_input' : 'file_upload',
                sourceLanguage: 'English',
                targetLanguages: [targetLanguage],
                status: 'COMPLETED',
                requestedAt: new Date().toISOString(),
              });
            }

            setActiveTab(fileState.id);
          } catch (e) {
            updateFileState(fileState.id, {
              status: 'error',
              progress: 0,
              error: e instanceof Error ? e.message : 'An error occurred',
            });
          }
        });

      await Promise.all(translationPromises);
    });
  };

  const onSummarize = (id: string, text: string) => {
    startSummarizing(async () => {
      const result = await handleSummarize(text);
      if ('error' in result) {
        toast({ title: 'Summarization failed', description: result.error, variant: 'destructive' });
      } else {
        updateFileState(id, { summary: result.summary });
        toast({ title: 'Summary Generated', description: 'AI has summarized the translation.' });
      }
    });
  };

  const playTranslation = (id: string, text: string) => {
    startSpeaking(async () => {
      const response = await handleTextToSpeech(text);
      if ('error' in response) {
        toast({ title: 'Speech Error', description: response.error, variant: 'destructive' });
      } else {
        updateFileState(id, { audioUri: response.audioDataUri });
        const audio = new Audio(response.audioDataUri);
        audio.play().catch(e => {
          console.error('Audio playback failed:', e);
          toast({ title: 'Playback Error', description: 'Your browser blocked automatic playback.', variant: 'destructive' });
        });
      }
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAudio = (dataUri: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearQueue = () => {
    setFiles([]);
    setActiveTab(undefined);
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Professional Document Translator</CardTitle>
            <CardDescription>Upload assets or use resources for high-fidelity regional conversion.</CardDescription>
          </div>
          <Badge variant="outline" className="h-fit">v2.1 AI Voice Enabled</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50',
            files.length > 0 ? 'p-6' : 'p-12'
          )}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className={cn("mb-2 h-12 w-12 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
          <p className="font-semibold text-foreground text-lg">
            {files.length > 0 ? 'Add more files' : 'Drop documents here'}
          </p>
          <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
            Supports professional documents and standard image formats
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            accept=".doc,.docx,.pdf,image/png,image/jpeg,.txt"
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-700">
                <FileText className="h-4 w-4" />
                Processing Queue
                <Badge variant="secondary" className="ml-1">{files.length}</Badge>
              </h3>
              <Button variant="ghost" size="sm" onClick={clearQueue} className="text-xs text-muted-foreground hover:text-destructive h-8 gap-2">
                <RotateCcw className="h-3 w-3" />
                Clear Queue
              </Button>
            </div>
            <div className="max-h-[600px] space-y-3 overflow-y-auto rounded-xl border bg-slate-50/50 p-4 shadow-inner">
              <Accordion type="single" collapsible value={activeTab} onValueChange={setActiveTab} className="w-full space-y-3">
                {files.map((fileState) => (
                  <AccordionItem 
                    key={fileState.id} 
                    value={fileState.id} 
                    className={cn(
                      "rounded-xl border bg-card px-5 shadow-sm transition-all overflow-hidden",
                      fileState.status === 'done' && "border-green-200 bg-green-50/20"
                    )}
                  >
                    <div className="flex items-center gap-4 py-4">
                      <div className="flex-shrink-0">{getFileIcon(fileState.file.name)}</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-semibold">{fileState.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(fileState.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {fileState.status === 'done' && (
                          <Badge className="bg-green-500 hover:bg-green-600 gap-1.5 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </Badge>
                        )}
                        {(fileState.status === 'uploading' || fileState.status === 'translating') && (
                          <div className="flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                        {fileState.status === 'done' && <AccordionTrigger className="p-0 hover:no-underline" />}
                      </div>
                    </div>

                    {(fileState.status === 'uploading' || fileState.status === 'translating') && (
                      <Progress value={fileState.progress} className="mb-4 h-1.5" />
                    )}

                    <AccordionContent>
                      <div className="pb-6 pt-2 space-y-6 border-t animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                <Languages className="h-4 w-4" /> Translated Text
                              </h4>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 gap-2 border-primary/20 hover:bg-primary/5" 
                                  onClick={() => playTranslation(fileState.id, fileState.translatedText!)}
                                  disabled={isSpeaking}
                                >
                                  {isSpeaking ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Voice...
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="h-3 w-3" />
                                      Listen
                                    </>
                                  )}
                                </Button>
                                {fileState.audioUri && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 gap-2 text-primary"
                                    onClick={() => downloadAudio(fileState.audioUri!, `${fileState.file.name.split('.')[0]}_audio.wav`)}
                                  >
                                    <Headphones className="h-3 w-3" />
                                    Download Audio
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto rounded-lg border bg-white p-4 text-sm leading-relaxed shadow-sm">
                               <p className="whitespace-pre-wrap">{fileState.translatedText}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-accent flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> AI Summary
                              </h4>
                              {!fileState.summary && (
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="h-8 gap-2"
                                  onClick={() => onSummarize(fileState.id, fileState.translatedText!)}
                                  disabled={isSummarizing}
                                >
                                  {isSummarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                  Summarize
                                </Button>
                              )}
                            </div>
                            <div className="max-h-60 min-h-[100px] overflow-y-auto rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm leading-relaxed shadow-sm">
                              {fileState.summary ? (
                                <p className="italic text-slate-700">{fileState.summary}</p>
                              ) : (
                                <p className="text-muted-foreground italic flex items-center gap-2 h-full justify-center">
                                  Click "Summarize" for AI insights.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                           <Button className="gap-2" onClick={() => downloadAsFile(fileState.translatedText!, `${fileState.file.name.split('.')[0]}_translated.txt`)}>
                            <Download className="h-4 w-4" /> Download Text Result
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">Target Region:</span>
            <Select onValueChange={(v) => setTargetLanguage(v as SupportedLanguage)} defaultValue={targetLanguage}>
              <SelectTrigger className="w-full sm:w-[220px] rounded-lg h-11 border-primary/20">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onTranslate} disabled={isTranslating || files.length === 0} className="w-full sm:w-auto h-11 px-10 rounded-lg text-lg font-bold shadow-lg shadow-primary/20">
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Translating...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-5 w-5" /> Translate Queue
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}