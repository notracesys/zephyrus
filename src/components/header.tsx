
'use client';

import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAppConfig } from '@/components/config-provider';
import { cn } from '@/lib/utils';

const Logo = () => {
  const config = useAppConfig();
  return (
    <Link href="/" className="flex items-center gap-2">
        <Avatar className="h-10 w-10 border-2 border-primary/40 shadow-[0_0_10px_rgba(255,0,184,0.3)]">
            <AvatarImage src={config.headerAvatar} alt={`Logo ${config.siteName}`} />
            <AvatarFallback className="bg-primary text-white font-black">{config.siteName.slice(0,1)}</AvatarFallback>
        </Avatar>
        <span className="font-black text-xl text-white tracking-tighter italic">@{config.siteName.toLowerCase()}</span>
    </Link>
  );
};


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
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </div>
                <span className="text-[11px] sm:text-xs text-white/80 font-black uppercase tracking-widest whitespace-nowrap">
                  {mounted && isReady ? `${activeUsers} ${t.users_active}` : '...'}
                </span>
            </div>
        </div>
      </div>
    </header>
  );
}
