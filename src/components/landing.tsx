
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
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 text-center overflow-hidden bg-black">
      {/* Background Elements based on the image */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-950/30 to-transparent" />
        
        {/* Floating Particles/Glows */}
        <div className="absolute top-10 right-[10%] w-2 h-2 bg-pink-500 rounded-full blur-sm animate-pulse" />
        <div className="absolute bottom-40 left-[15%] w-1 h-1 bg-red-500 rounded-full blur-[1px] animate-bounce" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Badge: ANÁLISES LIMITADAS HOJE */}
        <div className="mb-10 animate-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-3 px-6 py-2 border-2 border-[#ff00b8] bg-black/40 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(255,0,184,0.3)]">
            <Flame className="h-5 w-5 text-[#ff00b8] fill-[#ff00b8] animate-pulse" />
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">
              Análises Limitadas Hoje
            </span>
          </div>
        </div>

        {/* Main Title: SUA CONTA FOI BANIDA? AINDA DÁ TEMPO. */}
        <h1 className="font-black italic text-5xl md:text-8xl tracking-tighter uppercase leading-[0.85] text-white animate-in fade-in zoom-in-95 duration-1000">
          Sua conta foi <br />
          <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">Banida?</span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Ainda dá tempo.</span>
        </h1>

        {/* Subtitle */}
        <div className="mt-8 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-lg md:text-2xl font-black italic text-white uppercase tracking-tight">
            Quem demora, perde chances.
          </p>
          <p className="max-w-xl mx-auto text-sm md:text-lg text-zinc-400 font-medium leading-tight">
            Nossa análise mostra o caminho certo <br /> antes que seja tarde.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="group relative h-20 px-12 bg-gradient-to-r from-[#ff00b8] to-[#d40099] hover:from-[#d40099] hover:to-[#ff00b8] text-white font-black italic text-2xl md:text-3xl uppercase tracking-tighter rounded-xl shadow-[0_0_40px_rgba(255,0,184,0.5)] transition-all hover:scale-[1.05] border-t-2 border-white/20"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                <span className="relative z-10 flex items-center gap-4">
                  {config.ctaText || t.cta}
                  <ArrowRight className="h-8 w-8 stroke-[4]" />
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] bg-[#0f0f0f] border-[#ff00b8]/30 text-white rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase text-white tracking-tight">
                  {t.terms_title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium">
                  {t.terms_desc}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-64 mt-4 pr-4 border border-zinc-800 rounded-2xl p-4 bg-black/40">
                <div className="space-y-4 text-sm text-zinc-300 font-medium leading-relaxed">
                  {t.terms_body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center space-x-3 pt-6">
                <Checkbox 
                  id="terms" 
                  checked={agreed} 
                  onCheckedChange={(checked) => setAgreed(!!checked)}
                  className="border-[#ff00b8] data-[state=checked]:bg-[#ff00b8]"
                />
                <Label htmlFor="terms" className="text-sm font-bold uppercase tracking-wide cursor-pointer text-zinc-200">
                  {t.terms_agree}
                </Label>
              </div>
              <DialogFooter className="pt-6 gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="text-zinc-500 font-bold hover:text-white uppercase tracking-widest text-xs">
                    {t.cancel}
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleProceed} 
                  disabled={!agreed} 
                  className={cn(
                    "font-black italic uppercase tracking-tighter text-lg bg-[#ff00b8] hover:bg-[#d40099] text-white px-8 rounded-xl", 
                    !agreed && "opacity-50"
                  )}
                >
                  {t.proceed}
                  <ArrowRight className="ml-2 h-5 w-5 stroke-[3]" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Decorative Bottom Bars */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent opacity-50 shadow-[0_0_20px_rgba(255,0,184,0.8)]" />
    </div>
  );
}
