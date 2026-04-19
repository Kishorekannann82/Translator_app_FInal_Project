'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentTranslator from './document-translator';
import QualityTester from './quality-tester';
import AudioTranslator from './audio-translator';
import { FileText, TestTube2, Mic } from 'lucide-react';

export default function TranslationWorkspace() {
  return (
    <div className="w-full max-w-6xl">
      <Tabs defaultValue="translate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="translate">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Translate</span> Documents
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Mic className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Audio</span> Translation
          </TabsTrigger>
          <TabsTrigger value="test">
            <TestTube2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Quality</span> Tester
          </TabsTrigger>
        </TabsList>
        <TabsContent value="translate" className="mt-6">
          <DocumentTranslator />
        </TabsContent>
        <TabsContent value="audio" className="mt-6">
          <AudioTranslator />
        </TabsContent>
        <TabsContent value="test" className="mt-6">
          <QualityTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}
