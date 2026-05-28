'use client';

import { translations, Language } from './translations';
import { useState, useEffect } from 'react';

export { translations };
export type { Language };

export function useLanguage() {
  // Inicializa com o idioma salvo se disponível, para evitar flash de inglês
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_lang') as Language;
      if (saved === 'en' || saved === 'es' || saved === 'pt') return saved;
    }
    return 'en';
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es' || savedLang === 'pt')) {
      setLang(savedLang);
    }
    setIsReady(true);
  }, []);

  const t = translations[lang];

  return { lang, t, isReady };
}
