'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Send, ShieldCheck, Lock, MessageCircle, PartyPopper } from 'lucide-react';
import Link from 'next/link';
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

// Ícone oficial do Telegram via SVG
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.28.28-.43.28l.214-3.04 5.532-4.997c.24-.213-.054-.334-.373-.12l-6.84 4.307-2.946-.92c-.64-.203-.654-.64.135-.95l11.51-4.434c.532-.194 1 .126.792.892z"/>
  </svg>
);

export default function Landing() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="animate-in fade-in-50 duration-1000 pb-20">
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase">
        Sua conta foi banida? Nem tudo está perdido.
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
        Recuperar sua conta não é uma questão de sorte. É uma questão de saber o que dizer. A maioria fracassa porque fala qualquer coisa, de qualquer jeito. Nós descobrimos o que funciona.
      </p>
      
      <div className="mt-10 flex flex-col items-center gap-6">
        {/* CTA Principal para Desbanimento */}
        <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full sm:w-auto font-bold relative overflow-hidden bg-primary text-primary-foreground h-14 px-10 text-lg before:absolute before:inset-0 before:-translate-x-full before:animate-shine before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
            >
              Recuperar Conta Banida
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Termos de Responsabilidade e Condições</DialogTitle>
              <DialogDescription>
                Leia atentamente antes de prosseguir com a sua solicitação de Desbanimento.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="text-sm text-foreground/80 space-y-4">
                <span className="block font-bold text-foreground">Fica expressamente reconhecido que o CONTRATADO não garante, promete ou assegura a reversão, desbloqueio, recuperação ou restabelecimento de contas, itens virtuais, progressos, patentes ou quaisquer ativos digitais, uma vez que a decisão final e soberana compete exclusivamente à plataforma responsável (Garena).</span>
                <span className="block">O presente site tem por objeto a prestação de serviços independentes de análise técnica, orientação e suporte informacional, voltados exclusivamente à contestação administrativa de banimentos.</span>
                <span className="block">O CONTRANTE declara ciência inequívoca de que o CONTRATADO não possui qualquer vínculo, parceria ou afiliação com a empresa Garena, sendo todas as marcas mencionadas de propriedade exclusiva de seus respectivos titulares.</span>
                <span className="block">O CONTRATADO não realiza, em nenhuma hipótese, acesso direto ou indireto a servidores internos da plataforma.</span>
                <span className="block">Ao utilizar este site ou contratar quaisquer serviços nele oferecidos, o CONTRANTE declara ter lido, compreendido e concordado integralmente com os presentes termos.</span>
              </div>
            </ScrollArea>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
              <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Li e concordo com os termos e quero prosseguir.
              </Label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" size="sm">
                  Cancelar
                </Button>
              </DialogClose>
              <Button asChild disabled={!agreed} size="sm" className={cn("mb-2 sm:mb-0", !agreed && "cursor-not-allowed")}>
                <Link href="/verify">
                  Prosseguir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Card de Presente Semanal */}
        <div className="w-full max-w-2xl p-4 rounded-xl border border-primary/30 bg-primary/5 animate-in slide-in-from-top-4 duration-700 delay-200">
           <p className="font-black text-base md:text-lg flex items-center justify-center gap-2 text-primary uppercase text-center italic tracking-tighter">
             🥳 ACESSO GRÁTIS TODA SEMANA! 🎉
           </p>
           <p className="text-[13px] md:text-sm text-muted-foreground mt-1 text-center font-bold">
             A cada final de semana eu dou 1 acesso do método completo para alguém lá do grupo!
           </p>
        </div>

        {/* Seção VIP Group para Recuperação de FB/Google - TELEGRAM */}
        <div className="w-full max-w-2xl p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm animate-in fade-in zoom-in duration-1000 delay-300 shadow-2xl shadow-blue-900/10">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-500/20 p-3 rounded-full">
                    <TelegramIcon className="h-10 w-10 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl md:text-2xl uppercase italic tracking-tighter">Resenha do Zephyrus - VIP</h3>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed px-2">
                    Recupere sua conta de <strong>Facebook ou Google</strong> hoje. Eu revelo o segredo que ninguém conta lá dentro. Além disso, sorteio do <strong>Método Grátis</strong> todo final de semana. Entre agora antes que o link expire!
                  </p>
                </div>
                <Button 
                    asChild 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-10 shadow-lg shadow-blue-900/40 w-full sm:w-auto uppercase tracking-widest text-base"
                >
                    <Link href="https://t.me/zephyrus_grupo" target="_blank">
                        <TelegramIcon className="mr-2 h-6 w-6" />
                        ENTRAR NO CANAL AGORA
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
