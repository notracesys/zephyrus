'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Lock, MessageCircle, PartyPopper } from 'lucide-react';
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

// Ícone oficial do WhatsApp via SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.119.554 4.188 1.611 6.04L0 24l6.12-1.605c1.788.974 3.793 1.488 5.833 1.49h.005c6.634 0 12.032-5.394 12.036-12.031a11.83 11.83 0 00-3.415-8.471"/>
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

        {/* Seção VIP Group para Recuperação de FB/Google */}
        <div className="w-full max-w-2xl p-6 rounded-2xl border border-green-500/30 bg-green-500/5 backdrop-blur-sm animate-in fade-in zoom-in duration-1000 delay-300 shadow-2xl shadow-green-900/10">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                    <WhatsAppIcon className="h-10 w-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl md:text-2xl uppercase italic tracking-tighter">Oportunidade Única no Grupo VIP</h3>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed px-2">
                    Quer recuperar sua conta de <strong>Facebook ou Google</strong>? Eu entrego o segredo lá dentro. E ainda concorra ao <strong>Método Grátis</strong> toda semana. Não fique de fora da próxima liberação!
                  </p>
                </div>
                <Button 
                    asChild 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 px-10 shadow-lg shadow-green-900/40 w-full sm:w-auto uppercase tracking-widest text-base"
                >
                    <Link href="https://wa.me/5500000000000" target="_blank">
                        <WhatsAppIcon className="mr-2 h-6 w-6" />
                        ENTRAR NO GRUPO AGORA
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
