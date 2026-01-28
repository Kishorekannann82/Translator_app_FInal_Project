import React from 'react';

export default function Header() {
  return (
    <header className="flex w-full flex-col items-center border-b bg-card p-4 text-center shadow-sm">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        Bhasha Kavach
      </h1>
      <p className="mt-1 text-sm text-muted-foreground sm:text-base">
        AI-Powered Translation for CIPAM IPR Awareness
      </p>
    </header>
  );
}
