'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Language } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { Globe, ShieldCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const BRFlag = () => (
  <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-sm">
    <path fill="#009b3a" d="M0 0h720v504H0z"/><path fill="#fedf00" d="m360 54 306 198-306 198L54 252z"/><circle fill="#002776" cx="360" cy="252" r="108"/><path fill="#fff" d="M256.7 274.5c34.8-13 74.5-20.2 116.3-20.2 36 0 70.4 5.3 101.5 15.1l-1.4-17c-30.8-10.4-65.4-16.1-102.1-16.1-42.5 0-83 7.6-118.4 21.1z"/>
  </svg>
);
const USFlag = () => (
  <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-sm">
    <path fill="#bd3d44" d="M0 0h640v480H0z"/><path stroke="#fff" strokeWidth="37" d="M0 37h640m0 74H0m0 74h640m0 74H0m0 74h640m0 74H0"/><path fill="#192f5d" d="M0 0h256v222H0z"/>
  </svg>
);
const ESFlag = () => (
  <svg viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-sm">
    <path fill="#c60b1e" d="M0 0h750v500H0z"/><path fill="#ffc400" d="M0 125h750v250H0z"/>
  </svg>
);

export default function LanguageSelectorDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isHome = pathname === '/' || pathname === '';
    if (!isHome) return;
    
    const justPicked = sessionStorage.getItem('lang_picked_at_home');
    if (!justPicked) {
      setShowDialog(true);
    }
  }, [pathname, mounted]);

  const handleSelect = (lang: Language) => {
    localStorage.setItem('app_lang', lang);
    sessionStorage.setItem('lang_picked_at_home', 'true');
    setShowDialog(false);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!mounted || !showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[94%] max-w-[420px] rounded-[2rem] bg-[#080808] border-none p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] focus:outline-none"
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="sr-only">
          <DialogTitle>Language Selection / Seleção de Idioma</DialogTitle>
          <DialogDescription>Please select your preferred language to customize the system interface.</DialogDescription>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-8 flex flex-col items-start gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2px] bg-primary" />
            <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Setup</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl border border-primary/30 bg-zinc-900/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,184,0.2)]">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">SELECT LANGUAGE</h2>
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-primary">SELECIONE O IDIOMA</h2>
            </div>
          </div>

          <p className="text-zinc-500 text-sm font-medium tracking-tight">
            Choose your preferred language to start.
          </p>

          <div className="w-full flex flex-col gap-3 mt-2">
            {[
              { id: 'pt' as Language, label: 'Português', sub: 'BRASIL / PORTUGAL', flag: <BRFlag />, selected: true },
              { id: 'en' as Language, label: 'English', sub: 'NORTH AMERICA / GLOBAL', flag: <USFlag /> },
              { id: 'es' as Language, label: 'Español', sub: 'LATINOAMÉRICA / ESPAÑA', flag: <ESFlag /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "relative w-full h-20 bg-[#121212] rounded-2xl border transition-all duration-200 flex items-center px-4 group",
                  item.selected 
                    ? "border-primary shadow-[0_0_20px_rgba(255,0,184,0.3)] ring-1 ring-primary/50" 
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2.5 shadow-inner">
                  {item.flag}
                </div>

                <div className="flex flex-col items-start ml-4 flex-grow leading-tight">
                  <span className="text-base font-black text-white">{item.label}</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                    {item.sub}
                  </span>
                </div>

                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  item.selected 
                    ? "bg-primary border-primary" 
                    : "bg-transparent border-zinc-800"
                )}>
                  {item.selected && <Check className="w-4 h-4 text-white stroke-[4]" />}
                </div>
              </button>
            ))}
          </div>

          <div className="w-full pt-6 flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-lg border border-primary/30 bg-zinc-900/50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
            <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
              Secure & Encrypted Analysis
            </span>
          </div>

        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
      </DialogContent>
    </Dialog>
  );
}