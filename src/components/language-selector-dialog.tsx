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

export default function LanguageSelectorDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show on home page (/)
    if (pathname !== '/') {
      sessionStorage.removeItem('lang_picked_at_home');
      setShowDialog(false);
      return;
    }

    // Check if picked in this session
    const justPicked = sessionStorage.getItem('lang_picked_at_home');
    if (!justPicked) {
      setShowDialog(true);
    }
  }, [pathname]);

  const handleSelect = (lang: Language) => {
    localStorage.setItem('app_lang', lang);
    sessionStorage.setItem('lang_picked_at_home', 'true');
    setShowDialog(false);
    window.location.reload();
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[92%] max-w-[420px] rounded-3xl bg-card/95 backdrop-blur-2xl border-primary/40 p-10 shadow-[0_0_50px_-12px_rgba(255,204,0,0.3)]" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-6">
          <div className="mx-auto bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center border-2 border-primary/30 animate-pulse">
            <Globe className="text-primary h-10 w-10" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-center text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight">
              Select Language <br />
              <span className="text-primary">Selecciona Idioma</span>
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium text-base">
              Choose your preferred language to start the recovery process.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-5 mt-8">
          <Button 
            onClick={() => handleSelect('en')} 
            className="h-20 text-xl font-bold flex items-center justify-start gap-6 px-8 border-2 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 group rounded-2xl"
            variant="outline"
          >
            <span className="text-4xl group-hover:scale-125 transition-transform duration-300">🇺🇸</span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg">English</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">North America / Global</span>
            </div>
          </Button>
          
          <Button 
            onClick={() => handleSelect('es')} 
            className="h-20 text-xl font-bold flex items-center justify-start gap-6 px-8 border-2 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 group rounded-2xl"
            variant="outline"
          >
            <span className="text-4xl group-hover:scale-125 transition-transform duration-300">🇪🇸</span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg">Español</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Latinoamérica / España</span>
            </div>
          </Button>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
            Secure & Encrypted Analysis
          </p>
          <div className="h-1 w-12 bg-primary/20 rounded-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
