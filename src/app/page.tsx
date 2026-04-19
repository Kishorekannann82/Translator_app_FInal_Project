'use client';

import { useEffect } from 'react';
import Navbar from '@/components/bhasha-kavach/navbar';
import TranslationWorkspace from '@/components/bhasha-kavach/translation-workspace';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function Home() {
  const auth = useAuth();

  useEffect(() => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/50 dark:bg-slate-950/50">
      <Navbar />
      <main className="container mx-auto flex flex-1 flex-col items-center py-8 px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Translation Workspace
          </h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Secure, AI-powered multilingual translation for professional resources.
          </p>
        </div>
        <TranslationWorkspace />
      </main>
    </div>
  );
}
