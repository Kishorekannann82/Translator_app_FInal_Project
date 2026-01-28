import Header from '@/components/bhasha-kavach/header';
import TranslationWorkspace from '@/components/bhasha-kavach/translation-workspace';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
        <TranslationWorkspace />
      </main>
    </div>
  );
}
