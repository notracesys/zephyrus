'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Timer, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { useAppConfig } from '@/components/config-provider';
import { useSearchParams } from 'next/navigation';

export default function AlertaUrgentePage() {
  const { t, lang } = useLanguage();
  const config = useAppConfig();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePurchase = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    const tracking = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_term: searchParams.get('utm_term') || '',
      utm_content: searchParams.get('utm_content') || '',
      src: searchParams.get('src') || 'backredirect-urgente',
    };

    const baseCheckoutUrl = lang === 'pt' ? config.checkoutUrlPt : config.checkoutUrlEnEs;

    try {
      const checkoutUrl = new URL(baseCheckoutUrl);
      Object.entries(tracking).forEach(([key, value]) => {
        if (value) checkoutUrl.searchParams.append(key, value);
      });

      if (firestore) {
        await addDoc(collection(firestore, 'checkoutClicks'), {
          timestamp: serverTimestamp(),
          source: 'back-redirect-urgente',
          url: checkoutUrl.toString(),
          siteId: sessionStorage.getItem('active_site_id') || 'global'
        });
      }

      window.location.href = checkoutUrl.toString();
    } catch (e) {
      window.location.href = baseCheckoutUrl;
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-black text-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg space-y-4">
            
            {/* Aviso de Emergência Minimalista */}
            <div className="bg-white text-black py-2 px-6 flex items-center justify-between font-black uppercase text-[10px] tracking-[0.3em]">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    Protocolo de Crise
                </div>
                <div className="flex items-center gap-2 font-mono">
                    <Timer className="h-4 w-4" />
                    {formatTime(seconds)}
                </div>
            </div>

            <Card className="border-none bg-zinc-950 shadow-none rounded-none">
                <CardContent className="p-0 space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] text-white">
                            {t.alerta_urgente_title}
                        </h2>
                        
                        <div className="space-y-4">
                            <p className="text-lg md:text-xl text-zinc-400 font-bold uppercase tracking-tight leading-none">
                                {t.alerta_urgente_subtitle || "O TEMPO ACABOU"}
                            </p>
                            <p className="text-zinc-500 text-sm md:text-base leading-tight">
                                {t.alerta_urgente_main_text.replace(/\*\*/g, '')}
                            </p>
                        </div>

                        <div className="border-l-2 border-white p-4 bg-zinc-900/50">
                            <p className="text-white text-sm md:text-base font-bold italic opacity-90 leading-tight">
                                "{t.alerta_urgente_warning}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handlePurchase} 
                            className="w-full font-black h-auto py-6 md:py-8 text-xl md:text-2xl uppercase italic tracking-tighter bg-primary text-primary-foreground hover:scale-[1.02] transition-transform rounded-none"
                        >
                            {isRedirecting ? (
                              <div className="flex items-center gap-3">
                                <Loader2 className="h-7 w-7 animate-spin" /> 
                                <span>SINCRONIZANDO...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3">
                                <span>{t.alerta_urgente_cta}</span>
                                <ArrowRight className="h-8 w-8" />
                              </div>
                            )}
                        </Button>
                        
                        <div className="flex justify-center items-center gap-6 opacity-30">
                             <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                <ShieldAlert className="h-3 w-3" /> Acesso Seguro
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                Resposta Imediata
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <p className="text-zinc-800 text-[10px] text-center font-black uppercase tracking-[0.4em] pt-4">
                Expiração em tempo real. Ação irreversível.
            </p>
        </div>
      </main>
    </div>
  );
}
