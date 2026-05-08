'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
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
  const [serviceType, setServiceType] = useState<'unban' | 'recovery' | null>(null);

  return (
    <div className="animate-in fade-in-50 duration-1000 pb-20">
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase">
        Sua conta foi banida? Nem tudo está perdido.
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
        Recuperar sua conta não é uma questão de sorte. É uma questão de saber o que dizer. A maioria fracassa porque fala qualquer coisa, de qualquer jeito. Nós descobrimos o que funciona.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              onClick={() => setServiceType('unban')}
              className="w-full sm:w-auto font-bold relative overflow-hidden bg-primary text-primary-foreground before:absolute before:inset-0 before:-translate-x-full before:animate-shine before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
            >
              Recuperar Conta Banida
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </DialogTrigger>
          
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setServiceType('recovery')}
              className="w-full sm:w-auto font-bold border-primary/50 hover:bg-primary/10"
            >
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Recuperar Facebook / Google
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Termos de Responsabilidade e Condições</DialogTitle>
              <DialogDescription>
                Leia atentamente antes de prosseguir com a sua solicitação de {serviceType === 'unban' ? 'Desbanimento' : 'Recuperação'}.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="text-sm text-foreground/80 space-y-4">
                <span className="block font-bold text-foreground">Fica expressamente reconhecido que o CONTRATADO não garante, promete ou assegura a reversão, desbloqueio, recuperação ou restabelecimento de contas, itens virtuais, progressos, patentes ou quaisquer ativos digitais, uma vez que a decisão final e soberana compete exclusivamente à plataforma responsável (Garena, Facebook, Google).</span>
                <span className="block">O presente site tem por objeto a prestação de serviços independentes de análise técnica, orientação e suporte informacional, voltados exclusivamente à contestação administrativa de banimentos ou recuperação de acesso a contas.</span>
                <span className="block">O CONTRATANTE declara ciência inequívoca de que o CONTRATADO não possui qualquer vínculo, parceria ou afiliação com a empresa Garena, Meta (Facebook) ou Google, sendo todas as marcas mencionadas de propriedade exclusiva de seus respectivos titulares.</span>
                <span className="block">O CONTRATADO não realiza, em nenhuma hipótese, acesso direto ou indireto a sistemas internos, servidores ou bancos de dados de terceiros. Os serviços limitam-se à orientação quanto a procedimentos formais de solicitação de revisão.</span>
                <span className="block">O CONTRATANTE declara que todas as informações fornecidas são verdadeiras, assumindo integral responsabilidade por eventuais inconsistências ou omissões.</span>
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
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
        <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm border-primary/20">
            <ShieldCheck className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Especialistas em Jogos</h3>
            <p className="text-muted-foreground text-sm">Focados em Free Fire e outras plataformas competitivas.</p>
        </div>
        <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm border-primary/20">
            <Lock className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Recuperação Social</h3>
            <p className="text-muted-foreground text-sm">Métodos avançados para recuperar logins de Facebook e Google vinculados.</p>
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
