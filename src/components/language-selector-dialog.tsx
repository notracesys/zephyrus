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
import { translations, Language } from '@/lib/i18n';
import Image from 'next/image';

export default function LanguageSelectorDialog() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (!savedLang) {
      setShowDialog(true);
    }
  }, []);

  const handleSelect = (lang: Language) => {
    localStorage.setItem('app_lang', lang);
    setShowDialog(false);
    window.location.reload(); // Recarrega para aplicar as traduções em todos os componentes
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] bg-background border-primary/20">
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
