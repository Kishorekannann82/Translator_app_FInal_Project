'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Languages, Lightbulb, ShieldCheck, Gavel, BookOpen } from 'lucide-react';

interface IprResource {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const resources: IprResource[] = [
  {
    id: '1',
    title: 'Basics of Patents',
    category: 'Educational',
    type: 'PATENT',
    description: 'An introductory guide to understanding what can be patented and why it matters for innovators.',
    icon: <Lightbulb className="h-5 w-5" />,
    content: "A patent is an exclusive right granted for an invention, which is a product or a process that provides, in general, a new way of doing something, or offers a new technical solution to a problem. To get a patent, technical information about the invention must be disclosed to the public in a patent application."
  },
  {
    id: '2',
    title: 'Trademarks & Branding',
    category: 'Guideline',
    type: 'TRADEMARK',
    description: 'How to protect your business identity and logos through standard trademark registration processes.',
    icon: <ShieldCheck className="h-5 w-5" />,
    content: "A trademark is a sign capable of distinguishing the goods or services of one enterprise from those of other enterprises. Trademarks are protected by intellectual property rights. At the national/regional level, trademark protection can be obtained through registration, by filing an application for registration with the national/regional trademark office."
  },
  {
    id: '3',
    title: 'IPR Enforcement Rules 2024',
    category: 'Legal',
    type: 'ENFORCEMENT',
    description: 'The latest regulatory framework for police and judiciary regarding IPR violations and enforcement.',
    icon: <Gavel className="h-5 w-5" />,
    content: "The IPR Enforcement Rules 2024 provide updated guidelines for the seizure of counterfeit goods and the prosecution of intellectual property crimes. It strengthens the role of special cells in identifying and curbing digital piracy and physical trademark infringement."
  },
  {
    id: '4',
    title: 'Copyright for Creatives',
    category: 'Educational',
    type: 'COPYRIGHT',
    description: 'Protecting literary, musical, and artistic works in the digital age for modern creators.',
    icon: <BookOpen className="h-5 w-5" />,
    content: "Copyright is a legal term used to describe the rights that creators have over their literary and artistic works. Works covered by copyright range from books, music, paintings, sculpture, and films, to computer programs, databases, advertisements, maps, and technical drawings."
  }
];

interface IprRepositoryProps {
  onTranslateNow: (content: string) => void;
}

export default function IprRepository({ onTranslateNow }: IprRepositoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">IPR Repository</h2>
          <p className="text-sm text-muted-foreground">Access standard CIPAM resources for translation and training.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden border-slate-200 transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  {resource.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] font-bold uppercase tracking-wider h-5">
                      {resource.type}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{resource.category}</span>
                  </div>
                  <CardTitle className="mt-1 text-lg">{resource.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-2 min-h-[40px] text-slate-600">
                {resource.description}
              </CardDescription>
              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-500 hover:text-slate-900">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  className="h-9 gap-2 bg-[#1e293b] hover:bg-[#0f172a]"
                  onClick={() => onTranslateNow(resource.content)}
                >
                  <Languages className="h-4 w-4" />
                  Translate Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
