'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Timer, ArrowRight, Loader2, ShieldAlert, Zap } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect, Suspense } from 'react';
import { useAppConfig } from '@/components/config-provider';
import { useSearchParams } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function AlertaUrgenteContent() {
  const { t, lang } = useLanguage();
  const config = useAppConfig();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [seconds, setSeconds] = useState(600); // 10 minutos de urgência

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

  const handlePurchase = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    const tracking = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_term: searchParams.get('utm_term') || '',
      utm_content: searchParams.get('utm_content') || '',
      src: searchParams.get('src') || 'back-redirect-urgente',
    };

    // Utiliza os links configurados no Portal do Chefe (AppConfig)
    const baseCheckoutUrl = lang === 'pt' ? config.checkoutUrlPt : config.checkoutUrlEnEs;

    try {
      const checkoutUrl = new URL(baseCheckoutUrl);
      Object.entries(tracking).forEach(([key, value]) => {
        if (value) checkoutUrl.searchParams.append(key, value);
      });

      if (firestore) {
        const clickData = {
          timestamp: serverTimestamp(),
          source: 'back-redirect-urgente',
          url: checkoutUrl.toString(),
          siteId: sessionStorage.getItem('active_site_id') || 'global'
        };

        // Escrita não-bloqueante conforme diretrizes
        addDoc(collection(firestore, 'checkoutClicks'), clickData)
          .catch(async () => {
            const permissionError = new FirestorePermissionError({
              path: 'checkoutClicks',
              operation: 'create',
              requestResourceData: clickData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }

      // Redirecionamento imediato para o checkout
      window.location.href = checkoutUrl.toString();
    } catch (e) {
      window.location.href = baseCheckoutUrl;
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Efeito de brilho vermelho de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-xl space-y-6 relative z-10">
            
            {/* Barra de Status de Emergência */}
            <div className="bg-red-600 text-white py-3 px-6 flex items-center justify-between font-black uppercase text-[10px] md:text-xs tracking-[0.2em] animate-pulse rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-white" />
                    APROVEITE ENQUANTO HÁ TEMPO
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums">
                    <Timer className="h-4 w-4" />
                    {formatTime(seconds)}
                </div>
            </div>

            <Card className="border-x-2 border-b-2 border-red-600/40 bg-zinc-950/90 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(220,38,38,0.5)] rounded-t-none rounded-b-3xl">
                <CardContent className="p-8 md:p-10 space-y-8">
                    <div className="space-y-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-600/50 mb-2">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                            A GARENA VAI <br /> <span className="text-red-600">ATUALIZAR!</span>
                        </h2>
                        
                        <div className="space-y-4">
                            <p className="text-lg md:text-xl text-white font-bold uppercase tracking-tight leading-none bg-red-600/10 py-2">
                                RECUPERAÇÃO EM RISCO TOTAL
                            </p>
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-medium">
                                Identificamos que a Garena lançará uma nova tecnologia de segurança nas próximas horas. <b>Após esta atualização, será fisicamente IMPOSSÍVEL desbanir qualquer conta.</b>
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-left">
                            <p className="text-red-500 text-xs font-black uppercase tracking-widest mb-1">Aviso do Sistema:</p>
                            <p className="text-zinc-400 text-xs md:text-sm italic leading-tight">
                                "Não perca tempo. Se você não agir agora, seus dados serão deletados permanentemente dos servidores e nem mesmo o nosso código poderá te salvar."
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 pt-2">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handlePurchase} 
                            className="group w-full font-black h-auto py-6 md:py-8 text-xl md:text-2xl uppercase italic tracking-tighter bg-gradient-to-b from-green-500 to-green-700 text-white transition-all duration-200 rounded-full border-none shadow-[0_8px_0_rgb(21,128,61),0_15px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_rgb(21,128,61),0_10px_20px_rgba(0,0,0,0.4)] hover:translate-y-[2px] active:shadow-none active:translate-y-[8px] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                            
                            {isRedirecting ? (
                              <div className="flex items-center gap-3 justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" /> 
                                <span>SALVANDO CONTA...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3 relative z-10">
                                <span>RECUPERAR AGORA</span>
                                <ArrowRight className="h-7 w-7" />
                              </div>
                            )}
                        </Button>
                        
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex justify-center items-center gap-4 opacity-50">
                                <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                    <ShieldAlert className="h-3 w-3" /> Criptografia Ativa
                                </div>
                                <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                                <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                    Acesso Imediato
                                </div>
                            </div>
                            <p className="text-red-900 text-[9px] text-center font-black uppercase tracking-[0.4em] animate-pulse">
                                STATUS: APROVEITE ENQUANTO HÁ TEMPO
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
  );
}

export default function AlertaUrgentePage() {
  return (
    <div className="flex min-h-full flex-col bg-black text-white selection:bg-red-600">
      <Header />
      <Suspense fallback={<div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <AlertaUrgenteContent />
      </Suspense>
    </div>
  );
}
