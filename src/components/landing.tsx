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

export default function Landing() {
  const { t } = useLanguage();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (agreed) {
      router.push('/verify');
    }
  };

  return (
    <div className="animate-in fade-in-50 duration-1000 pb-20">
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase">
        {t.subtitle}
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
        {t.description}
      </p>
      
      <div className="mt-10 flex flex-col items-center gap-6">
        <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full sm:w-auto font-bold relative overflow-hidden bg-primary text-primary-foreground h-14 px-10 text-lg before:absolute before:inset-0 before:-translate-x-full before:animate-shine before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
            >
              {t.cta}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>{t.terms_title}</DialogTitle>
              <DialogDescription>
                {t.terms_desc}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="text-sm text-foreground/80 space-y-4">
                {t.terms_body.map((paragraph, idx) => (
                  <span key={idx} className={cn("block", idx === 0 && "font-bold text-foreground")}>
                    {paragraph}
                  </span>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
              <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                {t.terms_agree}
              </Label>
            </div>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="button" variant="secondary" size="sm">
                  {t.cancel}
                </Button>
              </DialogClose>
              <Button 
                onClick={handleProceed} 
                disabled={!agreed} 
                size="sm" 
                className={cn(
                  "mb-2 sm:mb-0 font-bold", 
                  !agreed && "opacity-50 cursor-not-allowed"
                )}
              >
                {t.proceed}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
