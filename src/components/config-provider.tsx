
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

interface AppConfig {
  siteName: string;
  primaryColor: string; // Ex: "48 100% 50%"
  checkoutUrlPt: string;
  checkoutUrlEnEs: string;
  headerAvatar: string;
  teamAvatar: string;
  ctaText: string;
}

const ConfigContext = createContext<AppConfig | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const configRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'global');
  }, [firestore]);

  const { data: configData } = useDoc<AppConfig>(configRef);

  const defaultConfig: AppConfig = {
    siteName: 'Zephyrus',
    primaryColor: '48 100% 50%', // Amarelo padrão
    checkoutUrlPt: 'https://app.pushinpay.com.br/service/pay/A1B1A8D6-0667-48B5-94D6-CA3E768395D6',
    checkoutUrlEnEs: 'https://chk.eduzz.com/aziwk6nz?currency=USD',
    headerAvatar: '/eu.png',
    teamAvatar: '/equipe.png',
    ctaText: '',
  };

  const config = { ...defaultConfig, ...configData };

  return (
    <ConfigContext.Provider value={config}>
      {/* Injeção Dinâmica de CSS Variables */}
      <style jsx global>{`
        :root {
          --primary: ${config.primaryColor};
          --ring: ${config.primaryColor};
        }
      `}</style>
      {children}
    </ConfigContext.Provider>
  );
}

export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) return {
    siteName: 'Zephyrus',
    primaryColor: '48 100% 50%',
    checkoutUrlPt: 'https://app.pushinpay.com.br/service/pay/A1B1A8D6-0667-48B5-94D6-CA3E768395D6',
    checkoutUrlEnEs: 'https://chk.eduzz.com/aziwk6nz?currency=USD',
    headerAvatar: '/eu.png',
    teamAvatar: '/equipe.png',
    ctaText: '',
  };
  return context;
};
