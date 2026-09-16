
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-12 sm:gap-20 -mt-6">
        {/* Title Section */}
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="font-black italic text-[2.5rem] sm:text-7xl md:text-8xl tracking-tighter uppercase leading-[0.85] text-white break-words">
            Sua conta foi <br />
            Banida? <br />
            <span className="text-white opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] whitespace-nowrap">Ainda dá tempo.</span>
          </h1>
          
          <div className="space-y-4">
            <p className="text-xl sm:text-4xl font-black italic text-white uppercase tracking-tight">
              Quem demora, perde chances.
            </p>
            <p className="text-sm sm:text-xl text-zinc-500 font-bold leading-tight max-w-lg mx-auto uppercase tracking-wide">
              {t.description}
            </p>
          </div>
        </div>

        {/* CTA Button with Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="w-full max-w-md group animate-in slide-in-from-bottom-10 duration-1000">
              <Button 
                className="relative w-full h-20 sm:h-28 bg-primary hover:bg-primary/90 text-white font-black italic text-xl sm:text-3xl uppercase tracking-tighter rounded-2xl shadow-[0_0_40px_rgba(255,0,184,0.5)] transition-all hover:scale-[1.05] active:scale-95 border-t-2 border-white/30 flex items-center justify-center gap-3 overflow-hidden"
              >
                {/* Continuous Shine Animation */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shine skew-x-12" />
                </div>
                
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  {config.ctaText || t.cta}
                  <ArrowRight className="h-8 w-8 stroke-[4] shrink-0" />
                </span>
              </Button>
            </div>
          </DialogTrigger>

          <DialogContent className="w-[94vw] max-w-[500px] bg-[#0f0f0f] border-primary/30 text-white rounded-[2rem] p-6 gap-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-center">
                Termos de Uso
              </DialogTitle>
              <DialogDescription className="sr-only">
                Por favor, leia e aceite os termos de uso antes de prosseguir com a recuperação da conta.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] w-full rounded-xl border border-zinc-800 bg-black/50 p-4">
              <div className="text-sm text-zinc-400 space-y-4 font-medium leading-relaxed">
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
                className="border-primary data-[state=checked]:bg-primary mt-1 h-5 w-5 shrink-0 rounded-md"
              />
              <Label htmlFor="terms" className="text-xs sm:text-sm font-bold uppercase tracking-wide cursor-pointer text-zinc-200 select-none leading-snug">
                {t.terms_agree}
              </Label>
            </div>
            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="w-full text-zinc-500 font-bold hover:text-white uppercase tracking-widest text-xs h-12">
                  {t.cancel}
                </Button>
              </DialogClose>
              <Button 
                onClick={handleProceed} 
                disabled={!agreed} 
                className={cn(
                  "w-full font-black italic uppercase tracking-tighter text-lg bg-primary hover:bg-primary/90 text-white px-8 rounded-xl h-12 flex items-center justify-center gap-2", 
                  !agreed && "opacity-50"
                )}
              >
                {t.proceed}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
