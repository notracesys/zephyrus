'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Download, 
  PlayCircle, 
  FileText, 
  ShieldCheck, 
  Bot,
  ArrowRight,
  Info,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const accountIdSchema = z.object({
  accountId: z.string()
    .min(8, { message: 'O ID deve ter entre 8 e 12 dígitos.' })
    .max(12, { message: 'O ID deve ter entre 8 e 12 dígitos.' })
    .regex(/^\d+$/, { message: 'Insira apenas números.' }),
});

type AccountIdForm = z.infer<typeof accountIdSchema>;

const staticSupportPrompt = "Prezados, escrevo para solicitar um diagnóstico técnico referente a uma súbita impossibilidade de acessar minha conta. Ao tentar conectar, encontro uma restrição inesperada que não consigo resolver. Acredito que possa se tratar de uma anomalia sistêmica, pois tenho ciência de que minhas atividades sempre estiveram em conformidade com os Termos de Serviço. Solicito, por gentileza, uma verificação manual do estado da minha conta e um esclarecimento sobre a natureza desta restrição. Fico à disposição para auxiliar na investigação.";

export default function EntregaPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<AccountIdForm>({
    resolver: zodResolver(accountIdSchema),
    defaultValues: { accountId: '' },
  });

  const handleVerify = (values: AccountIdForm) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast({
        title: 'ID Validado',
        description: 'Conta vinculada ao sistema de recuperação.',
      });
    }, 1200);
  };

  const handleGeneratePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedPrompt(staticSupportPrompt);
      setShowPromptDialog(true);
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    toast({
        title: "Copiado!",
        description: "Texto pronto para ser colado no suporte.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <section className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Acesso VIP Liberado</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            BEM-VINDO AO MÉTODO <span className="text-primary">ZEPHYRUS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Siga os passos abaixo rigorosamente. O processo de recuperação foi iniciado e agora depende da sua execução técnica.
          </p>
        </section>

        <div className="grid gap-8">
          {/* PASSO 1: VÍDEO E GUIA */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-primary/20 bg-card/50 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="text-primary" />
                  Passo 1: Instruções Cruciais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-video bg-black flex items-center justify-center relative group">
                <div className="text-center p-6">
                   <PlayCircle className="h-16 w-16 text-primary/50 mb-4 group-hover:scale-110 transition-transform" />
                   <p className="text-muted-foreground font-medium">Assista ao vídeo antes de prosseguir</p>
                </div>
                {/* Overlay simulando vídeo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                   <p className="text-xs text-white/60">Aula 01: Como evitar o banimento permanente durante a revisão</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="text-primary" />
                  Material de Apoio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Baixe o manual completo em PDF com todos os códigos técnicos e horários de pico do suporte.
                </p>
                <Button className="w-full font-bold" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Guia PDF
                </Button>
                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-green-500 font-bold mb-2">
                        <CheckCircle2 className="h-3 w-3" />
                        ARQUIVO ATUALIZADO HOJE
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PASSO 2: GERADOR IA */}
          <Card className="border-primary/20 bg-card/50 overflow-hidden">
             <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="text-primary" />
                  Passo 2: Gerador de Defesa Técnica (IA)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                   <div className="text-center space-y-2">
                      <p className="text-muted-foreground">
                        Nossa IA vai gerar o texto exato que você deve enviar para a Garena. 
                        Este texto é otimizado para burlar filtros automáticos e exigir uma revisão humana.
                      </p>
                   </div>

                   <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium flex items-center gap-1">
                            ID da Conta que será recuperada
                            <Info className="h-3 w-3 text-muted-foreground" />
                         </label>
                         <div className="flex gap-2">
                            <Input 
                                {...form.register('accountId')}
                                placeholder="Ex: 12345678" 
                                className={cn(isVerified && "border-green-500")}
                                disabled={isVerified || isVerifying}
                            />
                            <Button type="submit" disabled={isVerified || isVerifying} className="min-w-[120px]">
                               {isVerifying ? <Loader2 className="animate-spin" /> : isVerified ? <ShieldCheck /> : 'Vincular'}
                            </Button>
                         </div>
                         {form.formState.errors.accountId && (
                             <p className="text-xs text-destructive font-medium">{form.formState.errors.accountId.message}</p>
                         )}
                      </div>
                   </form>

                   {isVerified && (
                      <div className="pt-4 animate-in zoom-in-95 duration-500">
                         <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center space-y-4">
                            <p className="font-bold">Sua conta foi vinculada com sucesso ao nosso protocolo de defesa.</p>
                            <Button 
                                size="lg" 
                                onClick={handleGeneratePrompt} 
                                disabled={isGenerating}
                                className="font-black"
                            >
                               {isGenerating ? (
                                   <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ANALISANDO BANIMENTO...
                                   </>
                               ) : (
                                   <>
                                    <Bot className="mr-2 h-5 w-5" />
                                    GERAR TEXTO DE APELAÇÃO
                                   </>
                               )}
                            </Button>
                         </div>
                      </div>
                   )}
                </div>
              </CardContent>
          </Card>

          {/* RODAPÉ DE AVISO */}
          <section className="bg-secondary/50 rounded-lg p-6 border border-border text-center">
             <h3 className="font-bold mb-2 flex items-center justify-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Próximos Passos
             </h3>
             <p className="text-sm text-muted-foreground">
                Após gerar o texto e enviar ao suporte, o prazo médio de resposta da plataforma é de 24h a 72h úteis. 
                Fique atento ao seu e-mail vinculado à conta do jogo.
             </p>
          </section>
        </div>
      </main>

      {/* DIALOG DO PROMPT GERADO */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                Texto de Defesa Gerado com Sucesso!
            </DialogTitle>
            <DialogDescription>
                Copie o texto abaixo e cole exatamente como está no campo "Descrição" do ticket de suporte.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
              <Textarea
                readOnly
                value={generatedPrompt}
                className="min-h-[200px] bg-muted/50 p-4 text-base leading-relaxed"
              />
              <div className="absolute top-2 right-2">
                 <Button size="icon" variant="ghost" onClick={copyToClipboard} className="hover:bg-primary/10">
                    {isCopied ? <Check className="text-green-500" /> : <Copy className="h-4 w-4" />}
                 </Button>
              </div>
          </div>
          <DialogFooter className="flex sm:justify-between items-center gap-4">
             <p className="text-[10px] text-muted-foreground uppercase font-bold">
                Protocolo: {Math.random().toString(36).substring(2, 10).toUpperCase()}
             </p>
             <div className="flex gap-2">
                <DialogClose asChild>
                    <Button variant="secondary">Fechar</Button>
                </DialogClose>
                <Button onClick={copyToClipboard} className="font-bold">
                    {isCopied ? 'Copiado!' : 'Copiar para o Suporte'}
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
