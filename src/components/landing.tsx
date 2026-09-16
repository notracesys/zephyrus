'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Flame } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { useAppConfig } from '@/components/config-provider';

export default function Landing() {
  const { t } = useLanguage();
  const router = useRouter();
  const config = useAppConfig();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (agreed) {
      router.push('/verify');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-6 text-center overflow-x-hidden bg-black w-full">
      {/* Background Elements based on the image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[280px] sm:w-[800px] h-[300px] bg-red-900/20 blur-[80px] sm:blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-950/20 to-transparent" />
        
        {/* Floating Particles/Glows */}
        <div className="absolute top-10 right-[10%] w-2 h-2 bg-pink-500 rounded-full blur-sm animate-pulse" />
        <div className="absolute bottom-40 left-[15%] w-1 h-1 bg-red-500 rounded-full blur-[1px] animate-bounce" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Badge: ANÁLISES LIMITADAS HOJE */}
        <div className="mb-6 sm:mb-10 animate-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 border-2 border-[#ff00b8] bg-black/55 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(255,0,184,0.3)]">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff00b8] fill-[#ff00b8] animate-pulse" />
            <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white">
              Análises Limitadas Hoje
            </span>
          </div>
        </div>

        {/* Main Title: SUA CONTA FOI BANIDA? AINDA DÁ TEMPO. */}
        <h1 className="font-black italic text-[2rem] sm:text-5xl md:text-8xl tracking-tighter uppercase leading-[1.05] sm:leading-[0.95] md:leading-[0.85] text-white animate-in fade-in zoom-in-95 duration-1000 max-w-full break-words">
          Sua conta foi <br />
          <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">Banida?</span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Ainda dá tempo.</span>
        </h1>

        {/* Subtitle */}
        <div className="mt-6 sm:mt-8 space-y-1.5 sm:space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-base sm:text-xl md:text-2xl font-black italic text-white uppercase tracking-tight">
            Quem demora, perde chances.
          </p>
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-lg text-zinc-400 font-medium leading-normal px-2">
            Nossa análise mostra o caminho certo <br className="hidden sm:inline" /> antes que seja tarde.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
          <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="group relative h-16 sm:h-20 w-full sm:w-auto px-6 sm:px-12 bg-gradient-to-r from-[#ff00b8] to-[#d40099] hover:from-[#d40099] hover:to-[#ff00b8] text-white font-black italic text-lg sm:text-2xl md:text-3xl uppercase tracking-tighter rounded-xl shadow-[0_0_30px_rgba(255,0,184,0.4)] transition-all hover:scale-[1.02] active:scale-95 border-t-2 border-white/20 flex items-center justify-center gap-2 sm:gap-4"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 w-full">
                  {config.ctaText || t.cta}
                  <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8 stroke-[3] sm:stroke-[4] shrink-0" />
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[94vw] max-w-[600px] bg-[#0f0f0f] border-[#ff00b8]/30 text-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-tight text-left sm:text-center">
                  {t.terms_title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium text-xs sm:text-sm text-left sm:text-center">
                  {t.terms_desc}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-48 sm:h-64 mt-2 pr-2 border border-zinc-800 rounded-xl p-3 sm:p-4 bg-black/40">
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                  {t.terms_body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-start space-x-3 pt-3">
                <Checkbox 
                  id="terms" 
                  checked={agreed} 
                  onCheckedChange={(checked) => setAgreed(!!checked)}
                  className="border-[#ff00b8] data-[state=checked]:bg-[#ff00b8] mt-0.5 h-4 w-4 shrink-0 rounded"
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm font-bold uppercase tracking-wide cursor-pointer text-zinc-200 select-none leading-tight">
                  {t.terms_agree}
                </Label>
              </div>
              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="w-full sm:w-auto text-zinc-500 font-bold hover:text-white uppercase tracking-widest text-[10px] sm:text-xs h-11">
                    {t.cancel}
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleProceed} 
                  disabled={!agreed} 
                  className={cn(
                    "w-full sm:w-auto font-black italic uppercase tracking-tighter text-base sm:text-lg bg-[#ff00b8] hover:bg-[#d40099] text-white px-6 sm:px-8 rounded-xl h-11 flex items-center justify-center gap-2", 
                    !agreed && "opacity-50"
                  )}
                >
                  {t.proceed}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3] shrink-0" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Decorative Bottom Bars */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent opacity-50 shadow-[0_0_20px_rgba(255,0,184,0.8)] z-40" />
    </div>
  );
}
