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
      <DialogContent className="sm:max-w-[400px] bg-background border-primary/20" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-black italic uppercase tracking-tighter">
            Select your language / Selecciona tu idioma
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose how you want to browse our platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button 
            onClick={() => handleSelect('en')} 
            className="h-16 text-lg font-bold flex items-center justify-center gap-3"
            variant="outline"
          >
            <span className="text-2xl">🇺🇸</span> English
          </Button>
          <Button 
            onClick={() => handleSelect('es')} 
            className="h-16 text-lg font-bold flex items-center justify-center gap-3"
            variant="outline"
          >
            <span className="text-2xl">🇪🇸</span> Español
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
