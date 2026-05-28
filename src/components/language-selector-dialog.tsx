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
import { Globe } from 'lucide-react';

// Componente para a Bandeira dos EUA em SVG
const USFlag = () => (
  <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-10 h-7 rounded shadow-sm">
    <path fill="#bd3d44" d="M0 0h640v480H0z"/>
    <path stroke="#fff" strokeWidth="37" d="M0 37h640m0 74H0m0 74h640m0 74H0m0 74h640m0 74H0"/>
    <path fill="#192f5d" d="M0 0h256v222H0z"/>
    <circle cx="128" cy="111" r="60" fill="#fff" opacity="0.3" />
  </svg>
);

// Componente para a Bandeira da Espanha em SVG
const ESFlag = () => (
  <svg viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg" className="w-10 h-7 rounded shadow-sm">
    <path fill="#c60b1e" d="M0 0h750v500H0z"/>
    <path fill="#ffc400" d="M0 125h750v250H0z"/>
  </svg>
);

// Componente para a Bandeira do Brasil em SVG
const BRFlag = () => (
  <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg" className="w-10 h-7 rounded shadow-sm">
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
      // Quando sair da home, limpamos o bloqueio de reload para que apareça na próxima volta
      sessionStorage.removeItem('lang_picked_at_home');
      setShowDialog(false);
      return;
    }

    // Se estiver na home, verifica se deve mostrar
    const justPicked = sessionStorage.getItem('lang_picked_at_home');
    if (!justPicked) {
      setShowDialog(true);
    }
  }, [pathname, mounted]);

  const handleSelect = (lang: Language) => {
    localStorage.setItem('app_lang', lang);
    // Marcamos que acabamos de escolher para evitar o loop infinito após o reload
    sessionStorage.setItem('lang_picked_at_home', 'true');
    setShowDialog(false);
    
    // Pequeno delay antes do reload para garantir a experiência visual
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!mounted || !showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[92%] max-w-[420px] rounded-3xl bg-card/95 backdrop-blur-2xl border-primary/40 p-8 md:p-10 shadow-[0_0_50px_-12px_rgba(255,204,0,0.3)]" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-6">
          <div className="mx-auto bg-primary/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 border-primary/30 animate-pulse">
            <Globe className="text-primary h-8 w-8 md:h-10 md:w-10" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-center text-xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight">
              Select Language <br />
              <span className="text-primary">Selecione o Idioma</span>
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium text-sm md:text-base">
              Choose your preferred language to start.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 md:gap-5 mt-6 md:mt-8">
          <Button 
            onClick={() => handleSelect('pt')} 
            className="h-16 md:h-20 text-lg md:text-xl font-bold flex items-center justify-start gap-4 md:gap-6 px-6 md:px-8 border-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all duration-300 group rounded-2xl"
            variant="outline"
          >
            <div className="group-hover:scale-110 transition-transform duration-300 shrink-0">
              <BRFlag />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-base md:text-lg">Português</span>
              <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Brasil / Portugal</span>
            </div>
          </Button>

          <Button 
            onClick={() => handleSelect('en')} 
            className="h-16 md:h-20 text-lg md:text-xl font-bold flex items-center justify-start gap-4 md:gap-6 px-6 md:px-8 border-2 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 group rounded-2xl"
            variant="outline"
          >
            <div className="group-hover:scale-110 transition-transform duration-300 shrink-0">
              <USFlag />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-base md:text-lg">English</span>
              <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">North America / Global</span>
            </div>
          </Button>
          
          <Button 
            onClick={() => handleSelect('es')} 
            className="h-16 md:h-20 text-lg md:text-xl font-bold flex items-center justify-start gap-4 md:gap-6 px-6 md:px-8 border-2 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 group rounded-2xl"
            variant="outline"
          >
            <div className="group-hover:scale-110 transition-transform duration-300 shrink-0">
              <ESFlag />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-base md:text-lg">Español</span>
              <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Latinoamérica / España</span>
            </div>
          </Button>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-center text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
            Secure & Encrypted Analysis
          </p>
          <div className="h-1 w-10 md:w-12 bg-primary/20 rounded-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
