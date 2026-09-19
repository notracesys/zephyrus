'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Zap, ArrowRight, Loader2, ShieldCheck, Lock, X } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useState, Suspense } from 'react';
import { useAppConfig } from '@/components/config-provider';
import { useSearchParams, useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function UpsellContent() {
  const { t, lang } = useLanguage();
  const config = useAppConfig();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBypassPurchase = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    const tracking = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_term: searchParams.get('utm_term') || '',
      utm_content: searchParams.get('utm_content') || '',
      src: searchParams.get('src') || 'upsell-bypass-brabo',
    };

    const baseCheckoutUrl = lang === 'pt' ? config.bypassUrlPt : config.bypassUrlEnEs;

    try {
      const checkoutUrl = new URL(baseCheckoutUrl);
      Object.entries(tracking).forEach(([key, value]) => {
        if (value) checkoutUrl.searchParams.append(key, value);
      });

      if (firestore) {
        const clickData = {
          timestamp: serverTimestamp(),
          source: 'upsell-bypass-brabo',
          url: checkoutUrl.toString(),
          siteId: sessionStorage.getItem('active_site_id') || 'global'
        };

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

      window.location.href = checkoutUrl.toString();
    } catch (e) {
      window.location.href = baseCheckoutUrl;
    }
  };

  const handleSkip = () => {
    router.push('/entrega');
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-2xl space-y-6 relative z-10">
            
            <div className="bg-red-600 text-white py-2 px-6 flex items-center justify-center gap-2 font-black uppercase text-[10px] md:text-xs tracking-[0.3em] rounded-full w-fit mx-auto mb-4 animate-pulse">
                <ShieldAlert className="h-4 w-4" />
                RISCO DE BLOQUEIO IRREVERSÍVEL
            </div>

            <Card className="border-amber-500/30 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_80px_-20px_rgba(245,158,11,0.4)] rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 md:p-12 space-y-8">
                    <div className="space-y-6 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 mb-2">
                            <Lock className="h-10 w-10 text-amber-500" />
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] text-white">
                            {t.upsell_title}
                        </h2>
                        
                        <div className="space-y-4 pt-2">
                            <p className="text-amber-500 text-sm md:text-lg font-black uppercase tracking-widest leading-none">
                                ATENÇÃO: SISTEMA DE SEGURANÇA DETECTADO
                            </p>
                            <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-medium italic">
                                {t.upsell_desc}
                            </p>
                        </div>

                        <div className="p-6 bg-red-600/20 rounded-3xl border border-red-600/30 text-center">
                            <p className="text-white text-sm md:text-base font-bold italic leading-tight">
                                "{t.upsell_warning}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 pt-4">
                        <Button 
                            disabled={isRedirecting}
                            onClick={handleBypassPurchase} 
                            className="group w-full font-black h-auto py-6 md:py-8 text-xl md:text-2xl uppercase italic tracking-tighter bg-gradient-to-b from-amber-400 to-amber-600 text-black transition-all duration-200 rounded-full border-none shadow-[0_8px_0_rgb(180,83,9),0_15px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_rgb(180,83,9),0_10px_20px_rgba(0,0,0,0.4)] hover:translate-y-[2px] active:shadow-none active:translate-y-[8px] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                            
                            {isRedirecting ? (
                              <div className="flex items-center gap-3 justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" /> 
                                <span>CRIPTOGRAFANDO...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3 relative z-10">
                                <span>{t.upsell_cta}</span>
                                <ArrowRight className="h-7 w-7" />
                              </div>
                            )}
                        </Button>
                        
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            onClick={handleSkip}
                            className="text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] h-10 px-6 rounded-full group"
                          >
                            <X className="h-3 w-3 mr-2 opacity-50 group-hover:opacity-100" />
                            {t.upsell_skip}
                          </Button>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-6 opacity-40 pt-4 border-t border-zinc-900">
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                            <ShieldCheck className="h-3 w-3" /> Bypass v4.0 Ativo
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                            <Zap className="h-3 w-3" /> Anti-Detection 2024
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
  );
}

export default function UpsellPage() {
  return (
    <div className="flex min-h-full flex-col bg-black text-white selection:bg-amber-500">
      <Header />
      <Suspense fallback={<div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>}>
        <UpsellContent />
      </Suspense>
    </div>
  );
}
