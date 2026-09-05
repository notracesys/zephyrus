'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Timer, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect, Suspense } from 'react';
import { useAppConfig } from '@/components/config-provider';
import { useSearchParams } from 'next/navigation';

function AlertaUrgenteContent() {
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
      src: searchParams.get('src') || 'back-redirect-urgente',
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
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Efeito de brilho vermelho de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg space-y-6 relative z-10">
            
            {/* Barra de Status de Emergência */}
            <div className="bg-red-600 text-white py-3 px-6 flex items-center justify-between font-black uppercase text-[10px] md:text-xs tracking-[0.2em] animate-pulse">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    CONEXÃO EM RISCO
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums">
                    <Timer className="h-4 w-4" />
                    {formatTime(seconds)}
                </div>
            </div>

            <Card className="border-2 border-red-600/30 bg-zinc-950/80 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)] rounded-none">
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] text-white">
                            SISTEMA <br /> <span className="text-red-600">BLOQUEADO!</span>
                        </h2>
                        
                        <div className="space-y-4">
                            <p className="text-lg md:text-xl text-red-500 font-bold uppercase tracking-tight leading-none">
                                {t.alerta_urgente_subtitle}
                            </p>
                            <p className="text-zinc-400 text-sm md:text-base leading-tight">
                                Detectamos que a Garena iniciará a atualização <b>'Anti-Unban 3.0'</b>. Após isso, os dados banidos serão deletados permanentemente.
                            </p>
                        </div>

                        <div className="border-l-4 border-red-600 p-4 bg-red-950/20 text-left">
                            <p className="text-white text-xs md:text-sm font-bold italic opacity-90 leading-tight">
                                "O tempo para injetar o código de recuperação está acabando. Esta é a sua última janela de acesso."
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handlePurchase} 
                            className="w-full font-black h-auto py-6 md:py-7 text-lg md:text-xl uppercase italic tracking-tighter bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] transition-transform rounded-none shadow-[0_10px_30px_-10px_rgba(22,163,74,0.4)] border-none"
                        >
                            {isRedirecting ? (
                              <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin" /> 
                                <span>SINCRONIZANDO...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3">
                                <span>RECUPERAR AGORA</span>
                                <ArrowRight className="h-7 w-7" />
                              </div>
                            )}
                        </Button>
                        
                        <div className="flex justify-center items-center gap-4 opacity-50">
                             <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                <ShieldAlert className="h-3 w-3" /> Criptografia Ativa
                            </div>
                            <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                Prioridade Máxima
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <p className="text-red-900 text-[9px] text-center font-black uppercase tracking-[0.4em] pt-2 animate-pulse">
                STATUS: SERVIDORES EM ATUALIZAÇÃO...
            </p>
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
