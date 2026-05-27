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
    // Se não estiver na home, fecha o diálogo e limpa a flag de sessão
    if (pathname !== '/') {
      sessionStorage.removeItem('lang_picked_at_home');
      setShowDialog(false);
      return;
    }

    // Se estiver na home (/), verifica se já escolheu nesta "visita" específica
    const justPicked = sessionStorage.getItem('lang_picked_at_home');
    if (!justPicked) {
      setShowDialog(true);
    }
  }, [pathname]);

  const handleSelect = (lang: Language) => {
    localStorage.setItem('app_lang', lang);
    // Marcamos que ele acabou de escolher para evitar o loop no reload
    sessionStorage.setItem('lang_picked_at_home', 'true');
    setShowDialog(false);
    window.location.reload();
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[90%] max-w-[400px] rounded-2xl bg-card/95 backdrop-blur-xl border-primary/30 p-8 shadow-2xl shadow-primary/10" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center border border-primary/20">
            <Globe className="text-primary h-8 w-8" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-center text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
              Select Language <br />
              <span className="text-primary">Selecciona Idioma</span>
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium">
              Choose your preferred language to start the recovery process.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Button 
            onClick={() => handleSelect('en')} 
            className="h-16 text-lg font-bold flex items-center justify-start gap-4 px-6 border-2 border-border/50 hover:border-primary hover:bg-primary/5 transition-all group"
            variant="outline"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🇺🇸</span>
            <div className="flex flex-col items-start leading-tight">
              <span>English</span>
              <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">North America / Europe</span>
            </div>
          </Button>
          
          <Button 
            onClick={() => handleSelect('es')} 
            className="h-16 text-lg font-bold flex items-center justify-start gap-4 px-6 border-2 border-border/50 hover:border-primary hover:bg-primary/5 transition-all group"
            variant="outline"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🇪🇸</span>
            <div className="flex flex-col items-start leading-tight">
              <span>Español</span>
              <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Latinoamérica / España</span>
            </div>
          </Button>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest font-bold opacity-50">
          Secure & Encrypted Analysis
        </p>
      </DialogContent>
    </Dialog>
  );
}
