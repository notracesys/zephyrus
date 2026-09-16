'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Language } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { Globe, Lock, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Componente para a Bandeira dos EUA em SVG
const USFlag = () => (
  <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-8 h-6 md:w-10 md:h-7 rounded-sm shadow-sm">
    <path fill="#bd3d44" d="M0 0h640v480H0z"/>
    <path stroke="#fff" strokeWidth="37" d="M0 37h640m0 74H0m0 74h640m0 74H0m0 74h640m0 74H0"/>
    <path fill="#192f5d" d="M0 0h256v222H0z"/>
    <circle cx="128" cy="111" r="60" fill="#fff" opacity="0.3" />
  </svg>
);

// Componente para a Bandeira da Espanha em SVG
const ESFlag = () => (
  <svg viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg" className="w-8 h-6 md:w-10 md:h-7 rounded-sm shadow-sm">
    <path fill="#c60b1e" d="M0 0h750v500H0z"/>
    <path fill="#ffc400" d="M0 125h750v250H0z"/>
  </svg>
);

// Componente para a Bandeira do Brasil em SVG
const BRFlag = () => (
  <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg" className="w-8 h-6 md:w-10 md:h-7 rounded-sm shadow-sm">
    <path fill="#009b3a" d="M0 0h720v504H0z"/>
    <path fill="#fedf00" d="m360 54 306 198-306 198L54 252z"/>
    <circle fill="#313131" cx="360" cy="252" r="117"/>
    <circle fill="#002776" cx="360" cy="252" r="108"/>
    <path fill="#fff" d="M256.7 274.5c34.8-13 74.5-20.2 116.3-20.2 36 0 70.4 5.3 101.5 15.1l-1.4-17c-30.8-10.4-65.4-16.1-102.1-16.1-42.5 0-83 7.6-118.4 21.1z"/>
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
    if (!isHome) {
      sessionStorage.removeItem('lang_picked_at_home');
      setShowDialog(false);
      return;
    }
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
        className="w-[94%] max-w-[480px] rounded-[2.5rem] bg-[#050505]/95 backdrop-blur-3xl border-[3px] border-[#ff00b8] p-6 md:p-10 shadow-[0_0_60px_rgba(255,0,184,0.4)] overflow-hidden animate-in zoom-in-95 duration-500" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Tech Details Decorativas */}
        <div className="absolute top-8 left-8 flex flex-col items-start gap-1 opacity-20 pointer-events-none hidden md:flex">
          <span className="text-[8px] font-black tracking-[0.3em] text-white">GLOBAL ACCESS</span>
          <span className="text-[8px] font-black tracking-[0.3em] text-white">BETTER</span>
          <span className="text-[8px] font-black tracking-[0.3em] text-white">RESULTS</span>
        </div>

        <button 
          onClick={() => setShowDialog(false)}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#ff00b8] blur-2xl opacity-30 rounded-full" />
            <div className="relative h-20 w-20 rounded-full border-2 border-[#ff00b8]/40 flex items-center justify-center bg-black/40">
              <div className="absolute inset-0 border-[1px] border-[#ff00b8]/20 rounded-full animate-[spin_10s_linear_infinite]" />
              <Globe className="text-[#ff00b8] h-10 w-10 drop-shadow-[0_0_8px_rgba(255,0,184,0.8)]" />
            </div>
          </div>

          <DialogHeader className="space-y-4 mb-10 w-full">
            <div className="space-y-1 text-center">
              <DialogTitle className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                SELECT LANGUAGE
              </DialogTitle>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-[0.9] text-[#ff00b8] drop-shadow-[0_0_10px_rgba(255,0,184,0.3)]">
                SELECIONE O IDIOMA
              </h2>
            </div>
            <DialogDescription className="text-center text-zinc-400 font-medium text-sm md:text-base tracking-tight italic">
              Choose your preferred language to start.
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full flex flex-col gap-4">
            {[
              { id: 'pt' as Language, label: 'Português', sub: 'BRASIL / PORTUGAL', flag: <BRFlag /> },
              { id: 'en' as Language, label: 'English', sub: 'NORTH AMERICA / GLOBAL', flag: <USFlag /> },
              { id: 'es' as Language, label: 'Español', sub: 'LATINOAMÉRICA / ESPAÑA', flag: <ESFlag /> }
            ].map((langItem) => (
              <Button 
                key={langItem.id}
                onClick={() => handleSelect(langItem.id)} 
                className={cn(
                  "h-20 md:h-24 w-full bg-[#0a0a0a]/80 border-2 border-[#ff00b8]/40 hover:border-[#ff00b8] hover:bg-[#ff00b8]/10 transition-all duration-300 group rounded-[1.2rem] shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 overflow-hidden relative"
                )}
                variant="outline"
              >
                {/* Efeito de brilho interno no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff00b8]/0 via-[#ff00b8]/5 to-[#ff00b8]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-1.5 bg-black/40 rounded-md border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {langItem.flag}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-lg md:text-xl font-black italic text-white uppercase tracking-tighter">{langItem.label}</span>
                    <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-2 group-hover:text-zinc-400 transition-colors">
                      {langItem.sub}
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#ff00b8]/10 p-2 rounded-lg border border-[#ff00b8]/20 group-hover:bg-[#ff00b8] transition-all duration-300 relative z-10">
                  <ChevronRight className="h-5 w-5 text-[#ff00b8] group-hover:text-white" />
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-3 px-6 py-2 bg-black/40 rounded-full border border-white/5 opacity-60">
              <Lock className="text-[#ff00b8] h-3 w-3" />
              <p className="text-[9px] md:text-[10px] text-zinc-300 uppercase tracking-[0.3em] font-black">
                SECURE & ENCRYPTED ANALYSIS
              </p>
            </div>
            
            {/* Decoração da barra inferior */}
            <div className="w-12 h-1.5 bg-[#ff00b8] rounded-full shadow-[0_0_10px_rgba(255,0,184,0.8)]" />
          </div>
        </div>

        {/* Detalhes de Corner (Estilo HUD) */}
        <div className="absolute bottom-6 left-6 opacity-20 pointer-events-none hidden md:block">
          <div className="flex flex-col gap-0.5 border-l border-[#ff00b8] pl-2 py-1">
             <span className="text-[7px] font-black text-white uppercase tracking-widest">ANÁLISE</span>
             <span className="text-[7px] font-black text-white uppercase tracking-widest">INTELIGÊNCIA</span>
             <span className="text-[7px] font-black text-white uppercase tracking-widest">EVOLUÇÃO</span>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none text-right hidden md:block">
          <div className="flex flex-col gap-0.5 border-r border-[#ff00b8] pr-2 py-1">
             <span className="text-[7px] font-black text-white uppercase tracking-widest">FOCO</span>
             <span className="text-[7px] font-black text-white uppercase tracking-widest">PLANEJAMENTO</span>
             <span className="text-[7px] font-black text-white uppercase tracking-widest">RESULTADOS</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

