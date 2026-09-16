
'use client';

import Header from '@/components/header';
import Landing from '@/components/landing';
import ParticleBackground from '@/components/particle-background';
import BrowserCheckDialog from '@/components/browser-check-dialog';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BrowserCheckDialog />
      <ParticleBackground />
      <div className="relative flex flex-col h-full">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
            <Landing />
          </div>
        </main>
      </div>
    </div>
  );
}
