'use client';

import { translations, Language } from './translations';
import { useState, useEffect } from 'react';

export { translations };
export type { Language };

export function useLanguage() {
  // Inicializa sempre com 'en' para garantir consistência entre servidor e primeira renderização do cliente (evita erro de hidratação)
  const [lang, setLang] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Apenas após a montagem no cliente, buscamos o idioma real salvo
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && (saved === 'en' || saved === 'es' || saved === 'pt')) {
      setLang(saved);
    }
    setIsReady(true);
  }, []);

  const t = translations[lang];

  return { lang, t, isReady };
}
