
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, Suspense } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface AppConfig {
  siteName: string;
  primaryColor: string;
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
  headerAvatar: '',
  teamAvatar: '',
  ctaText: '',
};

function ConfigLoader({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [siteId, setSiteId] = useState<string>('global');

  useEffect(() => {
    setMounted(true);
    
    // 1. Prioridade: Parâmetro na URL (?s=)
    const urlSiteId = searchParams.get('s');
    // 2. Segunda opção: Memória da sessão (sessionStorage)
    const storedSiteId = sessionStorage.getItem('active_site_id');

    if (urlSiteId) {
      setSiteId(urlSiteId);
      sessionStorage.setItem('active_site_id', urlSiteId);
    } else if (storedSiteId) {
      setSiteId(storedSiteId);
    } else {
      setSiteId('global');
    }
  }, [searchParams]);

  const configRef = useMemoFirebase(() => {
    if (!firestore || !siteId) return null;
    return doc(firestore, 'configs', siteId);
  }, [firestore, siteId]);

  const { data: configData, isLoading } = useDoc<AppConfig>(configRef);

  if (!mounted || isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
            Carregando Sistema...
          </p>
        </div>
      </div>
    );
  }

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
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </ConfigContext.Provider>
  );
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    }>
      <ConfigLoader>{children}</ConfigLoader>
    </Suspense>
  );
}

export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  return context || DEFAULT_CONFIG;
};
