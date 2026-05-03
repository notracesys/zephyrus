'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
      <div className="mt-10">
        <Dialog onOpenChange={(open) => !open && setAgreed(false)}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="font-bold relative overflow-hidden bg-primary text-primary-foreground before:absolute before:inset-0 before:-translate-x-full before:animate-shine before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
            >
              Adquirir Método
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Termos de Responsabilidade e Condições</DialogTitle>
              <DialogDescription>
                Leia atentamente antes de prosseguir.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <p className="text-sm text-foreground/80 space-y-4">
                <span className="block font-bold text-foreground">Fica expressamente reconhecido que o CONTRATADO não garante, promete ou assegura a reversão, desbloqueio, recuperação ou restabelecimento de contas, itens virtuais, progressos, patentes ou quaisquer ativos digitais, uma vez que a decisão final e soberana compete exclusivamente à plataforma responsável pelo jogo.</span>
                <span className="block">O presente site tem por objeto a prestação de serviços independentes de análise técnica, orientação e suporte informacional, voltados exclusivamente à contestação administrativa de banimentos aplicados em contas de jogos online.</span>
                <span className="block">O CONTRATANTE declara ciência inequívoca de que o CONTRATADO não possui, mantém ou alega possuir qualquer vínculo, parceria, autorização, representação, afiliação ou relação comercial com a empresa Garena, com o jogo Free Fire ou com quaisquer de suas controladoras, coligadas ou subsidiárias, sendo todas as marcas mencionadas de propriedade exclusiva de seus respectivos titulares.</span>
                <span className="block">O CONTRATADO não realiza, em nenhuma hipótese, acesso direto ou indireto, autorizado ou não, a sistemas internos, servidores, bancos de dados, códigos-fonte ou mecanismos de segurança de terceiros. Os serviços prestados limitam-se à análise das informações fornecidas pelo CONTRATANTE, organização de dados e orientação quanto a procedimentos formais de solicitação de revisão, sempre em conformidade com os termos de uso da plataforma.</span>
                <span className="block">O CONTRATANTE declara que todas as informações fornecidas são verdadeiras, assumindo integral responsabilidade por eventuais inconsistências, omissões ou declarações inverídicas que possam comprometer o resultado do procedimento.</span>
                <span className="block">O CONTRATADO não se responsabiliza por danos diretos, indiretos, incidentais, consequenciais, lucros cessantes ou perda de chance decorrentes de decisões adotadas pela plataforma do jogo, tampouco por suspensões, banimentos adicionais ou definitivos.</span>
                <span className="block">Este site não incentiva, apoia, promove ou compactua com o uso de trapaças, programas ileguis, hacks, exploits, engenharia reversa ou qualquer prática que viole os termos de uso, políticas internas ou legislação vigente.</span>
                <span className="block">Ao utilizar este site ou contratar quaisquer serviços nele oferecidos, o CONTRATANTE declara ter lido, compreendido e concordado integralmente com os presentes termos, que possuem caráter vinculante e irrevogável.</span>
              </p>
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
    </div>
  );
}
