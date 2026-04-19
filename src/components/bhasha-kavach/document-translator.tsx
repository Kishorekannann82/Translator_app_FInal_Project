
'use client';

import React, { useState, useTransition } from 'react';
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
} from '@/app/actions/translate';
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Languages,
  Volume2,
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

type FileStatus = 'pending' | 'uploading' | 'translating' | 'done' | 'error';

interface FileState {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  translatedText: string | null;
  error: string | null;
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

export default function DocumentTranslator() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [targetLanguage, setTargetLanguage] =
    useState<SupportedLanguage>('Hindi');
  const [isTranslating, startTranslation] = useTransition();
  const [isSpeaking, startSpeaking] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const newFileStates = Array.from(newFiles).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      status: 'pending' as FileStatus,
      progress: 0,
      translatedText: null,
      error: null,
    }));
    setFiles((prev) => [...prev, ...newFileStates]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
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
        description: 'Please upload at least one document to translate.',
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
            const fileType = fileState.file.type;
            let result: { translatedText: string } | { error: string };

            if (fileType.startsWith('text/') || fileState.file.name.endsWith('.txt')) {
              const text = await readFileAsText(fileState.file);
              updateFileState(fileState.id, { status: 'translating', progress: 50 });
              result = await handleTextTranslation(text, targetLanguage);
            } else {
              const dataUrl = await readFileAsDataURL(fileState.file);
              updateFileState(fileState.id, { status: 'translating', progress: 50 });
              result = await handleDocumentTranslation(dataUrl, targetLanguage);
            }

            if ('error' in result) {
              throw new Error(result.error);
            }
            
            updateFileState(fileState.id, {
              status: 'done',
              progress: 100,
              translatedText: result.translatedText,
            });
            
            setActiveTab(fileState.id);

          } catch (e) {
            const error = e instanceof Error ? e.message : 'An unknown error occurred';
            updateFileState(fileState.id, {
              status: 'error',
              progress: 0,
              error: error,
            });
            console.error(`Failed to translate ${fileState.file.name}:`, e);
          }
        });

      await Promise.all(translationPromises);
      toast({
        title: 'Translation Complete',
        description: 'All pending files have been processed.',
      });
    });
  };

  const playTranslation = (text: string) => {
    startSpeaking(async () => {
      const response = await handleTextToSpeech(text);
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

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translate Documents</CardTitle>
        <CardDescription>
          Upload Word, PDF, image, or text files for translation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors',
            isDragging ? 'border-primary bg-accent/50' : 'border-border',
            files.length > 0 ? 'p-6' : 'p-12'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">
            {files.length > 0 ? 'Add more files' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports .docx, .pdf, .png, .jpg, .txt
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,image/png,image/jpeg,.txt,text/plain"
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold">
              Files to Process
              <Badge variant="secondary">{files.length}</Badge>
            </h3>
            <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-md border p-4 bg-muted/20">
              <Accordion type="single" collapsible value={activeTab} onValueChange={setActiveTab} className="w-full space-y-3">
                {files.map((fileState) => (
                  <AccordionItem 
                    key={fileState.id} 
                    value={fileState.id} 
                    className={cn(
                      "rounded-lg border bg-card px-4 shadow-sm transition-all",
                      fileState.status === 'done' && "border-green-200 bg-green-50/30 dark:bg-green-900/10"
                    )}
                  >
                    <div className="flex items-center gap-4 py-3">
                      <div className="flex-shrink-0">{getFileIcon(fileState.file.name)}</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{fileState.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(fileState.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {fileState.status === 'pending' && <Badge variant="outline" className="font-normal">Pending</Badge>}
                        {(fileState.status === 'uploading' || fileState.status === 'translating') && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary animate-pulse">Translating...</span>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                        {fileState.status === 'done' && (
                          <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </Badge>
                        )}
                        {fileState.status === 'error' && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" /> Error
                          </Badge>
                        )}
                        {fileState.status === 'done' && (
                           <AccordionTrigger className="p-0 hover:no-underline" />
                        )}
                      </div>
                    </div>

                    {(fileState.status === 'uploading' || fileState.status === 'translating') && (
                      <Progress value={fileState.progress} className="mb-3 h-1" />
                    )}

                    {fileState.status === 'error' && (
                       <p className="pb-3 text-xs text-destructive">{fileState.error}</p>
                    )}

                    <AccordionContent>
                      <div className="pb-4 pt-2 space-y-4 border-t mt-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                             <Languages className="h-4 w-4" />
                             Translated Content ({targetLanguage})
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-2" 
                            onClick={() => playTranslation(fileState.translatedText!)}
                            disabled={isSpeaking || !fileState.translatedText}
                          >
                            {isSpeaking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                            Listen
                          </Button>
                        </div>
                        <div className="max-h-60 overflow-y-auto rounded-md border bg-background p-4 text-sm leading-relaxed shadow-inner">
                          {fileState.translatedText ? (
                            <p className="whitespace-pre-wrap">{fileState.translatedText}</p>
                          ) : (
                            <p className="italic text-muted-foreground">Processing translation...</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <Button size="sm" onClick={() => downloadAsFile(fileState.translatedText!, `${fileState.file.name.split('.')[0]}_translated.txt`)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download (.txt)
                          </Button>
                           <Button size="sm" variant="outline" onClick={() => downloadAsFile(fileState.translatedText!, `${fileState.file.name.split('.')[0]}_translated.docx`)}>
                            Download (.docx)
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
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Target Language:</span>
            <Select
              onValueChange={(value) => setTargetLanguage(value as SupportedLanguage)}
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
          </div>
          <Button onClick={onTranslate} disabled={isTranslating || files.length === 0} className="w-full sm:w-auto h-11 px-8">
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Documents...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-5 w-5" />
                Translate All Files
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
