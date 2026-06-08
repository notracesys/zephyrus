
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

interface AppConfig {
  siteName: string;
  primaryColor: string; // Ex: "48 100% 50%"
  ctaTextColor: 'black' | 'white';
  checkoutUrlPt: string;
  checkoutUrlEnEs: string;
  headerAvatar: string;
  teamAvatar: string;
  ctaText: string;
}

const ConfigContext = createContext<AppConfig | null>(null);

const DEFAULT_CONFIG: AppConfig = {
  siteName: 'Zephyrus',
  primaryColor: '48 100% 50%',
  ctaTextColor: 'black',
  checkoutUrlPt: 'https://app.pushinpay.com.br/service/pay/A1B1A8D6-0667-48B5-94D6-CA3E768395D6',
  checkoutUrlEnEs: 'https://chk.eduzz.com/aziwk6nz?currency=USD',
  headerAvatar: '/eu.png',
  teamAvatar: '/equipe.png',
  ctaText: '',
};

export function ConfigProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const configRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'global');
  }, [firestore]);

  const { data: configData } = useDoc<AppConfig>(configRef);

  // Garantimos que campos vazios no banco não quebrem o site, voltando para o padrão
  const config = {
    siteName: configData?.siteName || DEFAULT_CONFIG.siteName,
    primaryColor: configData?.primaryColor || DEFAULT_CONFIG.primaryColor,
    ctaTextColor: configData?.ctaTextColor || DEFAULT_CONFIG.ctaTextColor,
    checkoutUrlPt: configData?.checkoutUrlPt || DEFAULT_CONFIG.checkoutUrlPt,
    checkoutUrlEnEs: configData?.checkoutUrlEnEs || DEFAULT_CONFIG.checkoutUrlEnEs,
    headerAvatar: configData?.headerAvatar || DEFAULT_CONFIG.headerAvatar,
    teamAvatar: configData?.teamAvatar || DEFAULT_CONFIG.teamAvatar,
    ctaText: configData?.ctaText !== undefined ? configData.ctaText : DEFAULT_CONFIG.ctaText,
  };

  const primaryForeground = config.ctaTextColor === 'white' ? '210 20% 98%' : '0 0% 3%';

  return (
    <ConfigContext.Provider value={config}>
      <style jsx global>{`
        :root {
          --primary: ${config.primaryColor};
          --primary-foreground: ${primaryForeground};
          --ring: ${config.primaryColor};
        }
      `}</style>
      {children}
    </ConfigContext.Provider>
  );
}

export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  return context || DEFAULT_CONFIG;
};
