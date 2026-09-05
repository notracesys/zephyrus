'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Zap, Timer, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
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
  const [seconds, setSeconds] = useState(120); // 2 minutos - máxima urgência

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
    <div className="flex min-h-full flex-col bg-black selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-20 flex flex-col items-center justify-start md:justify-center">
        <div className="w-full max-w-xl space-y-6">
            
            {/* Barra de Status Minimalista */}
            <div className="bg-destructive text-white py-3 px-6 rounded-t-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 animate-pulse" />
                    <span className="font-black uppercase text-[10px] tracking-widest">Acesso em Risco</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-sm">
                    <Timer className="h-4 w-4" />
                    {formatTime(seconds)}
                </div>
            </div>

            <Card className="border-none bg-zinc-900 shadow-2xl overflow-hidden rounded-b-xl rounded-t-none">
                <CardContent className="p-8 md:p-12 space-y-8">
                    <div className="space-y-4 text-center">
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">
                            {t.alerta_urgente_title}
                        </h2>
                        <div className="h-1 w-20 bg-primary mx-auto" />
                    </div>
                    
                    <div className="space-y-6 text-center">
                        <p className="text-lg md:text-xl text-zinc-300 font-medium leading-tight">
                            {t.alerta_urgente_main_text.replace('**', '').replace('**', '')}
                        </p>
                        
                        <div className="border-l-4 border-primary bg-white/5 p-6 text-left">
                            <p className="text-white text-sm md:text-base font-bold leading-relaxed italic opacity-90">
                                "{t.alerta_urgente_warning}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handlePurchase} 
                            className="w-full font-black h-auto py-6 md:py-8 text-xl md:text-2xl uppercase italic tracking-tighter bg-primary text-primary-foreground hover:scale-[1.02] transition-transform shadow-[0_20px_40px_-10px_rgba(255,204,0,0.3)] border-b-4 border-black/20"
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
                        
                        <div className="flex justify-center items-center gap-6 opacity-40">
                             <div className="flex items-center gap-2 text-[9px] font-bold text-white uppercase tracking-widest">
                                <ShieldAlert className="h-3 w-3" /> 100% Protegido
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-white uppercase tracking-widest">
                                <Zap className="h-3 w-3" /> Resposta Imediata
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <p className="text-zinc-600 text-[10px] text-center font-bold uppercase tracking-[0.2em]">
                {t.alerta_urgente_footer}
            </p>
        </div>
      </main>
    </div>
  );
}
