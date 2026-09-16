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
    <div className="relative flex flex-col items-center justify-center px-4 py-2 text-center bg-black w-full overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[800px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-6 sm:gap-10 -mt-10">
        {/* Title Section */}
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="font-black italic text-[2.6rem] sm:text-6xl md:text-7xl tracking-tighter uppercase leading-[0.85] text-white break-words">
            Sua conta foi <br />
            <span className="text-white">Banida?</span> <br />
            <span className="text-white opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Ainda dá tempo.</span>
          </h1>
          
          <div className="space-y-1">
            <p className="text-lg sm:text-2xl font-black italic text-white uppercase tracking-tight">
              Quem demora, perde chances.
            </p>
            <p className="text-[12px] sm:text-base text-zinc-400 font-medium leading-tight max-w-[280px] sm:max-w-md mx-auto">
              Nossa análise mostra o caminho certo antes que seja tarde.
            </p>
          </div>
        </div>

        {/* Button Section */}
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="group relative overflow-hidden h-20 w-full px-8 bg-primary hover:bg-primary/90 text-white font-black italic text-xl sm:text-2xl uppercase tracking-tighter rounded-2xl shadow-[0_10px_40px_rgba(255,0,184,0.4)] transition-all hover:scale-[1.02] active:scale-95 border-t-2 border-white/20 flex items-center justify-center gap-3"
              >
                {/* Continuous Pink Shine Animation */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine skew-x-12" />
                </div>
                
                <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                  {config.ctaText || t.cta}
                  <ArrowRight className="h-7 w-7 stroke-[4] shrink-0" />
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[94vw] max-w-[500px] bg-[#0f0f0f] border-primary/30 text-white rounded-[2rem] p-6 gap-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase text-white tracking-tight text-center">
                  {t.terms_title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium text-sm text-center">
                  {t.terms_desc}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-64 mt-2 pr-2 border border-zinc-800 rounded-2xl p-4 bg-black/60">
                <div className="space-y-4 text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
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
                  <ArrowRight className="h-5 w-5 stroke-[3] shrink-0" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}