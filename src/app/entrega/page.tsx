
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShieldCheck, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

function EntregaContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const purchaseId = searchParams.get('id');

  useEffect(() => {
    async function verifyPurchase() {
      if (!purchaseId || !firestore) {
        setStatus('unauthorized');
        return;
      }

      try {
        const docRef = doc(firestore, 'purchases', purchaseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStatus('authorized');
        } else {
          setStatus('unauthorized');
        }
      } catch (error) {
        console.error("Erro ao verificar compra:", error);
        setStatus('unauthorized');
      }
    }

    verifyPurchase();
  }, [purchaseId, firestore]);

  const handleDownload = () => {
    window.open('https://placehold.co/600x400.pdf', '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Verificando sua credencial de acesso...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="w-full max-w-xl animate-in fade-in duration-500">
        <Card className="border-destructive/50 bg-destructive/5 shadow-2xl">
          <CardHeader className="text-center py-10">
            <div className="mx-auto bg-destructive text-destructive-foreground p-4 rounded-full w-fit mb-4">
              <Lock className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            <p className="text-muted-foreground">
              Não conseguimos validar sua compra. Certifique-se de que o pagamento foi aprovado e que você está usando o link enviado para o seu e-mail.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Voltar para o Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
          Obrigado pela confiança. Sua licença foi validada com sucesso.
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
            Clique abaixo para baixar o guia completo e iniciar o processo de recuperação.
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
        ID da Transação: <span className="text-foreground font-mono">{purchaseId}</span>
      </p>
    </div>
  );
}

export default function EntregaPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-24 flex flex-col items-center justify-center">
        <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
          <EntregaContent />
        </Suspense>
      </main>
    </div>
  );
}
