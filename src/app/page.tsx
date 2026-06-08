
'use client';

import Header from '@/components/header';
import Landing from '@/components/landing';
import ParticleBackground from '@/components/particle-background';
import BrowserCheckDialog from '@/components/browser-check-dialog';

export default function Home() {
  return (
    <div className="relative min-h-full">
      <BrowserCheckDialog />
      <ParticleBackground />
      <div className="relative flex min-h-full flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center pt-20 md:pt-32 text-center">
            <Landing />
          </div>
        </main>
      </div>
    </div>
  );
}
