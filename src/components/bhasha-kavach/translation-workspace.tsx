'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentTranslator from './document-translator';
import QualityTester from './quality-tester';
import AudioTranslator from './audio-translator';
import HistoryList from './history-list';
import IprRepository from './ipr-repository';
import { FileText, TestTube2, Mic, History, Library } from 'lucide-react';

export default function TranslationWorkspace() {
  const [activeTab, setActiveTab] = useState('translate');
  const [initialContent, setInitialContent] = useState<string | null>(null);

  const handleTranslateFromRepo = (content: string) => {
    setInitialContent(content);
    setActiveTab('translate');
    // We scroll up to ensure the user sees the switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-16 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 shadow-lg border border-slate-200/50">
          <TabsTrigger 
            value="translate" 
            className="rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-white gap-3 text-sm font-bold transition-all hover:bg-white/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger 
            value="repo" 
            className="rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-white gap-3 text-sm font-bold transition-all hover:bg-white/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Library className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Repository</span>
          </TabsTrigger>
          <TabsTrigger 
            value="audio" 
            className="rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-white gap-3 text-sm font-bold transition-all hover:bg-white/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Mic className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-white gap-3 text-sm font-bold transition-all hover:bg-white/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
              <History className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger 
            value="test" 
            className="rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-white gap-3 text-sm font-bold transition-all hover:bg-white/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <TestTube2 className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Tester</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TabsContent value="translate" className="m-0">
            <DocumentTranslator initialText={initialContent || undefined} onClearInitialText={() => setInitialContent(null)} />
          </TabsContent>
          <TabsContent value="repo" className="m-0">
            <IprRepository onTranslateNow={handleTranslateFromRepo} />
          </TabsContent>
          <TabsContent value="audio" className="m-0">
            <AudioTranslator />
          </TabsContent>
          <TabsContent value="history" className="m-0">
            <HistoryList />
          </TabsContent>
          <TabsContent value="test" className="m-0">
            <QualityTester />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
