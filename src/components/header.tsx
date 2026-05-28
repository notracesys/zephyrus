'use client';

import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

const Logo = () => (
    <Link href="/" className="flex items-center gap-1">
        <Avatar className="h-9 w-9">
            <AvatarImage src="/eu.png" alt="Profile of @zepphyrus" />
            <AvatarFallback>Z</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg text-foreground">@zepphyrus</span>
    </Link>
);


export default function Header() {
  const { t, isReady } = useLanguage();
  const [activeUsers, setActiveUsers] = useState(137);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveUsers(Math.floor(Math.random() * (200 - 100 + 1)) + 100);

    const interval = setInterval(() => {
      setActiveUsers(prevUsers => {
        const change = Math.floor(Math.random() * 11) - 5;
        let newCount = prevUsers + change;
        if (newCount < 100) newCount = 100;
        if (newCount > 200) newCount = 200;
        return newCount;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {/* Evita erro de hidratação: renderiza apenas após montar e o i18n estar pronto */}
                  {mounted && isReady ? `${activeUsers} ${t.users_active}` : '...'}
                </span>
            </div>
        </div>
      </div>
    </header>
  );
}
