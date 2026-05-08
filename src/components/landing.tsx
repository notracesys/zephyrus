
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Lock, MessageCircle } from 'lucide-react';
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
      
      <div className="mt-10 flex flex-col items-center gap-8">
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
                <span className="block">O CONTRATANTE declara ciência inequívoca de que o CONTRATADO não possui qualquer vínculo, parceria ou afiliação com a empresa Garena, sendo todas as marcas mencionadas de propriedade exclusiva de seus respectivos titulares.</span>
                <span className="block">O CONTRATADO não realiza, em nenhuma hipótese, acesso direto ou indireto a servidores internos da plataforma.</span>
                <span className="block">Ao utilizar este site ou contratar quaisquer serviços nele oferecidos, o CONTRATANTE declara ter lido, compreendido e concordado integralmente com os presentes termos.</span>
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

        {/* Seção VIP Group para Recuperação de FB/Google */}
        <div className="w-full max-w-2xl p-6 rounded-2xl border border-green-500/30 bg-green-500/5 backdrop-blur-sm animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                    <Lock className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-lg text-foreground/90 leading-relaxed px-2">
                    No meu <strong>Grupo VIP</strong>, eu ensino o passo a passo de como você pode tentar recuperar suas contas do <strong>Facebook ou Google</strong> que foram perdidas ou hackeadas.
                </p>
                <Button 
                    asChild 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 shadow-lg shadow-green-900/20"
                >
                    <Link href="https://wa.me/5500000000000" target="_blank">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Chamar no WhatsApp
                    </Link>
                </Button>
            </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
        <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm border-primary/20">
            <ShieldCheck className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Especialistas em Jogos</h3>
            <p className="text-muted-foreground text-sm">Focados em Free Fire e outras plataformas competitivas.</p>
        </div>
        <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm border-primary/20">
            <Lock className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Segurança Total</h3>
            <p className="text-muted-foreground text-sm">Métodos que respeitam os termos de serviço das plataformas.</p>
        </div>
        <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm border-primary/20">
            <ArrowRight className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Suporte Direto</h3>
            <p className="text-muted-foreground text-sm">Análise individualizada de cada caso por nossa equipe técnica.</p>
        </div>
      </div>
    </div>
  );
}
