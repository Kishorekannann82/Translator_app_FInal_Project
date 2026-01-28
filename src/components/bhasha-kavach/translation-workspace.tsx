'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentTranslator from './document-translator';
import QualityTester from './quality-tester';
import { FileText, TestTube2 } from 'lucide-react';

export default function TranslationWorkspace() {
  return (
    <div className="w-full max-w-6xl">
      <Tabs defaultValue="translate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="translate">
            <FileText className="mr-2 h-4 w-4" />
            Translate Documents
          </TabsTrigger>
          <TabsTrigger value="test">
            <TestTube2 className="mr-2 h-4 w-4" />
            Test Quality
          </TabsTrigger>
        </TabsList>
        <TabsContent value="translate" className="mt-6">
          <DocumentTranslator />
        </TabsContent>
        <TabsContent value="test" className="mt-6">
          <QualityTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}
