'use client';

import Header from '@/components/header';
import ChatInterface from '@/components/chat-interface';
import { Suspense } from 'react';
import { useLanguage } from '@/lib/i18n';

function ChatPageContent() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col bg-background h-screen">
      <Header />
      <main className="flex-grow flex flex-col">
        <ChatInterface />
      </main>
    </div>
  );
}

export default function ChatPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">{t.loading}</div>}>
      <ChatPageContent />
    </Suspense>
  );
}