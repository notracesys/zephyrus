'use client';

import { translations, Language } from './translations';
import { useState, useEffect } from 'react';

export { translations };
export type { Language };

export function useLanguage() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es' || savedLang === 'pt')) {
      setLang(savedLang);
    }
  }, []);

  const t = translations[lang];

  return { lang, t };
}
