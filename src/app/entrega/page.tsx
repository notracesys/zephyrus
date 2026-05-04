'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function EntregaPage() {
  const handleDownload = () => {
    // Aqui você pode colocar o link direto para o seu PDF/Arquivo
    // Por enquanto simula o download
    window.open('https://placehold.co/600x400.pdf', '_blank');
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-24 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <section className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Acesso VIP Confirmado</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              SEU MÉTODO ESTÁ <span className="text-primary">PRONTO!</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Clique no botão abaixo para baixar o conteúdo completo e iniciar sua recuperação.
            </p>
          </section>

          <Card className="border-primary/20 bg-card/50 shadow-2xl shadow-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 text-center py-8">
              <div className="mx-auto bg-primary text-primary-foreground p-4 rounded-full w-fit mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-bold">Download Liberado</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center gap-6">
              <p className="text-center text-muted-foreground text-sm">
                O arquivo contém o passo a passo detalhado, os códigos da IA e o manual de suporte.
              </p>
              
              <Button 
                onClick={handleDownload}
                size="lg" 
                className="w-full h-16 text-lg font-black uppercase tracking-widest relative overflow-hidden bg-primary text-primary-foreground before:absolute before:inset-0 before:-translate-x-full before:animate-shine before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
              >
                <Download className="mr-2 h-6 w-6" />
                Baixar Método Agora
              </Button>

              <div className="flex items-center gap-2 text-xs text-green-500 font-bold uppercase tracking-tighter">
                <CheckCircle2 className="h-3 w-3" />
                Link de acesso verificado e seguro
              </div>
            </CardContent>
          </Card>

          <p className="text-center mt-8 text-xs text-muted-foreground uppercase tracking-widest">
            O acesso a esta página é exclusivo. Não compartilhe este link.
          </p>
        </div>
      </main>
    </div>
  );
}
