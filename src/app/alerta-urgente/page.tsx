
'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Zap, Timer, ArrowRight, Loader2, Info, AlertTriangle, ShieldX } from 'lucide-react';
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
  const [seconds, setSeconds] = useState(180); // 3 minutos

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
    <div className="flex min-h-full flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in duration-700">
            
            {/* Barra de Status Crítico */}
            <div className="bg-destructive border-2 border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_0_30px_-5px_rgba(220,38,38,0.5)]">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                    <span className="text-white font-black uppercase text-[10px] md:text-xs tracking-widest">
                        STATUS: EMERGÊNCIA DE DADOS
                    </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-white font-bold">
                    <Timer className="h-4 w-4" />
                    {formatTime(seconds)}
                </div>
            </div>

            <Card className="border-primary/40 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(255,204,0,0.3)] overflow-hidden relative border-2">
                {/* Background Decorativo */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
                </div>

                <CardHeader className="items-center text-center p-8 border-b border-white/5 bg-white/5">
                    <ShieldX className="w-24 h-24 text-primary mb-6 animate-pulse" />
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                            {t.alerta_urgente_title}
                        </h2>
                        <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs">
                            {t.alerta_urgente_subtitle}
                        </p>
                    </div>
                </CardHeader>
                
                <CardContent className="text-center space-y-8 p-8 md:p-12 relative z-10">
                    <div className="space-y-6">
                        <p className="text-xl md:text-2xl text-zinc-100 font-medium leading-tight">
                            {t.alerta_urgente_main_text.split('**').map((part, i) => 
                                i % 2 === 1 ? <span key={i} className="text-primary font-black underline decoration-primary/30">{part}</span> : part
                            )}
                        </p>
                        
                        <div className="bg-destructive/10 p-6 rounded-2xl border-2 border-destructive/20 text-left space-y-4 shadow-inner">
                            <div className="flex items-center gap-3 text-destructive font-black uppercase text-sm">
                                <AlertTriangle className="h-5 w-5" />
                                AVISO DE SEGURANÇA MÁXIMA
                            </div>
                            <p className="text-zinc-300 text-sm md:text-base font-medium leading-relaxed italic">
                                "{t.alerta_urgente_warning}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-zinc-900 rounded-xl border border-white/5">
                                <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Velocidade</span>
                                <p className="text-white font-black">IMEDIATA</p>
                            </div>
                            <div className="p-4 bg-zinc-900 rounded-xl border border-white/5">
                                <Info className="h-6 w-6 text-primary mx-auto mb-2" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Risco</span>
                                <p className="text-white font-black">CRÍTICO</p>
                            </div>
                            <div className="p-4 bg-zinc-900 rounded-xl border border-white/5">
                                <ShieldAlert className="h-6 w-6 text-primary mx-auto mb-2" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Suporte</span>
                                <p className="text-white font-black">24H ATIVO</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-6">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handlePurchase} 
                            className="w-full font-black h-auto py-6 md:py-8 text-lg md:text-2xl uppercase italic tracking-tighter bg-primary text-primary-foreground hover:scale-[1.03] transition-all shadow-[0_20px_50px_-10px_rgba(255,204,0,0.4)] leading-none border-b-4 border-black/20"
                        >
                            {isRedirecting ? (
                              <div className="flex items-center justify-center gap-3">
                                <Loader2 className="h-7 w-7 animate-spin" /> 
                                <span>RECUPERANDO...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center text-center gap-3">
                                <span>{t.alerta_urgente_cta}</span>
                                <ArrowRight className="h-8 w-8 shrink-0" />
                              </div>
                            )}
                        </Button>
                        
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-4">
                            {t.alerta_urgente_footer}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 font-black text-xs text-white italic">
                    <ShieldAlert className="h-4 w-4" /> 100% SEGURO
                </div>
                <div className="flex items-center gap-2 font-black text-xs text-white italic">
                    <Zap className="h-4 w-4" /> ACESSO INSTANTÂNEO
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
