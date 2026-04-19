'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentTranslator from './document-translator';
import QualityTester from './quality-tester';
import AudioTranslator from './audio-translator';
import HistoryList from './history-list';
import { FileText, TestTube2, Mic, History } from 'lucide-react';

export default function TranslationWorkspace() {
  return (
    <div className="w-full max-w-6xl">
      <Tabs defaultValue="translate" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-14 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 shadow-sm border border-slate-200/50">
          <TabsTrigger value="translate" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tester</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="translate" className="mt-8 transition-all duration-300">
          <DocumentTranslator />
        </TabsContent>
        <TabsContent value="audio" className="mt-8 transition-all duration-300">
          <AudioTranslator />
        </TabsContent>
        <TabsContent value="history" className="mt-8 transition-all duration-300">
          <HistoryList />
        </TabsContent>
        <TabsContent value="test" className="mt-8 transition-all duration-300">
          <QualityTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}
