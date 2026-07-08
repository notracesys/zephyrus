'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, AlertTriangle, ArrowRight, Loader2, Skull, Timer, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { useAppConfig } from '@/components/config-provider';
import { useSearchParams } from 'next/navigation';

export default function OfertaRecusadaPage() {
  const { t, lang } = useLanguage();
  const config = useAppConfig();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [seconds, setSeconds] = useState(300); // 5 minutos de "janela secreta"

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
      src: searchParams.get('src') || '',
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
          source: 'oferta-recusada-agressiva',
          url: checkoutUrl.toString(),
          siteId: sessionStorage.getItem('active_site_id') || 'global'
        });
      }

      window.location.href = checkoutUrl.toString();
    } catch (e) {
      console.error("Redirect error:", e);
      window.location.href = baseCheckoutUrl;
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in duration-700">
            
            <div className="bg-destructive/10 border border-destructive/50 rounded-2xl p-4 flex items-center justify-center gap-3 animate-pulse">
                <Timer className="text-destructive h-5 w-5" />
                <span className="text-destructive font-black uppercase text-xs tracking-widest">
                    A JANELA DE RECUPERAÇÃO FECHA EM: {formatTime(seconds)}
                </span>
            </div>

            <Card className="border-destructive/40 bg-card/50 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(220,38,38,0.5)] overflow-hidden">
                <CardHeader className="items-center text-center p-8 bg-destructive/5 border-b border-destructive/10">
                    <Skull className="w-20 h-20 text-destructive mb-4 animate-bounce" />
                    <CardTitle className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                        VOCÊ VAI MESMO <br /> <span className="text-destructive underline">JOGAR TUDO NO LIXO?</span>
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-8 p-8 md:p-12">
                    <div className="space-y-4">
                        <p className="text-xl text-zinc-300 leading-tight">
                            Se você sair dessa página agora, o robô da Garena vai entender que você <span className="font-black text-white italic">DESISTIU</span> e vai apagar seus dados <span className="text-destructive font-bold">PARA SEMPRE.</span>
                        </p>
                        
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-left space-y-3">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-destructive" /> O QUE VOCÊ ESTÁ PERDENDO:
                            </p>
                            <ul className="text-zinc-200 text-sm space-y-2 font-medium">
                                <li className="flex items-center gap-2">❌ <span className="line-through opacity-50">Todas as suas Skins Raras</span></li>
                                <li className="flex items-center gap-2">❌ <span className="line-through opacity-50">Seus Passes de Elite Antigos</span></li>
                                <li className="flex items-center gap-2">❌ <span className="line-through opacity-50">Ouro, Diamantes e Nível da Conta</span></li>
                                <li className="flex items-center gap-2">❌ <span className="line-through opacity-50">Anos de esforço e dinheiro gasto</span></li>
                            </ul>
                        </div>

                        <p className="text-lg font-bold text-primary italic">
                            O robô não tem piedade. Sem o nosso código secreto, sua conta morre hoje. Você tem certeza que quer dar esse presente pra Garena?
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handlePurchase} 
                            className="w-full font-black h-auto py-6 text-lg sm:text-xl uppercase italic tracking-tighter bg-primary text-primary-foreground hover:scale-[1.03] transition-all shadow-[0_10px_40px_-10px_rgba(255,204,0,0.5)] leading-tight"
                        >
                            {isRedirecting ? (
                              <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> REDIRECIONANDO...</>
                            ) : (
                              <div className="flex items-center justify-center text-center px-4">
                                QUERO MINHA CONTA DE VOLTA AGORA
                                <ArrowRight className="ml-2 h-6 w-6 shrink-0" />
                              </div>
                            )}
                        </Button>
                        
                        <Button asChild variant="ghost" className="text-zinc-500 hover:text-destructive hover:bg-transparent font-bold text-xs uppercase tracking-widest">
                            <Link href="/">
                                <Home className="mr-2 h-3 w-3" />
                                Sim, eu aceito perder minha conta para sempre
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center opacity-40">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                    Aviso: Esta página expirará em instantes. Ação irreversível detectada.
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}