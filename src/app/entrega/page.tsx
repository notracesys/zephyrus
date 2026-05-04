
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShieldCheck, CheckCircle2, Lock, Loader2, RefreshCcw } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

function EntregaContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  
  // Pegamos o ID de qualquer lugar da URL
  const purchaseId = searchParams.get('id') || 
                     searchParams.get('transaction_id') || 
                     searchParams.get('tid') || 
                     searchParams.get('reference') ||
                     searchParams.get('ref');

  useEffect(() => {
    async function verifyPurchase() {
      if (!purchaseId) {
        setStatus('unauthorized');
        return;
      }

      if (!firestore) return;

      try {
        const docRef = doc(firestore, 'purchases', purchaseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStatus('authorized');
        } else if (retryCount < 10) { // Tentamos por 30 segundos
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
          return () => clearTimeout(timer);
        } else {
          setStatus('unauthorized');
        }
      } catch (error) {
        console.error("Erro ao verificar compra:", error);
        setStatus('unauthorized');
      }
    }

    verifyPurchase();
  }, [purchaseId, firestore, retryCount]);

  const handleDownload = () => {
    window.open('https://drive.google.com/file/d/14GPvzQOzMsub7hMpUdD-9blZ3WUVavJH/view?usp=sharing', '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Validando sua licença...</p>
        <p className="text-[10px] text-muted-foreground/40 mt-2 uppercase tracking-widest">
          Verificando ID: {purchaseId}
        </p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-destructive/30 bg-destructive/5 shadow-2xl">
          <CardHeader className="text-center py-8">
            <div className="mx-auto bg-destructive text-destructive-foreground p-3 rounded-full w-fit mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-bold">Acesso Pendente</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <p className="text-sm text-muted-foreground">
              Ainda não identificamos a aprovação do pagamento para este ID. Se você já pagou, aguarde 1 minuto e clique no botão abaixo.
            </p>
            <div className="flex flex-col gap-2">
                <Button onClick={() => window.location.reload()} variant="default" className="w-full font-bold">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Verificar Agora
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/">Voltar para o Início</Link>
                </Button>
            </div>
            {purchaseId && (
                <p className="text-[10px] text-muted-foreground font-mono uppercase pt-4 opacity-50">
                    ID Verificado: {purchaseId}
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <section className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Acesso Vitalício Liberado</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
          ACESSO <span className="text-primary italic">CONCEDIDO!</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Clique no botão abaixo para baixar o seu método agora.
        </p>
      </section>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 text-center py-10">
          <div className="mx-auto bg-primary text-primary-foreground p-5 rounded-full w-fit mb-4 shadow-lg shadow-primary/20">
            <Download className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-tighter">Download do Método</CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <Button 
            onClick={handleDownload}
            size="lg" 
            className="w-full h-16 text-lg font-black uppercase tracking-widest relative overflow-hidden bg-primary text-primary-foreground before:absolute before:inset-0 before:-translate-x-full before:animate-shine before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
          >
            Baixar Agora
          </Button>

          <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase tracking-widest">
            <CheckCircle2 className="h-3 w-3" />
            Certificado de Autenticidade Ativo
          </div>
        </CardContent>
      </Card>

      <p className="text-center mt-8 text-[10px] text-muted-foreground uppercase tracking-widest opacity-40">
        Licença vinculada: <span className="font-mono text-foreground">{purchaseId}</span>
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
