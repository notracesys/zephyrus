'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShieldCheck, CheckCircle2, Lock, Loader2, RefreshCcw } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

function EntregaContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  
  const purchaseId = searchParams.get('id') || searchParams.get('transaction_id') || searchParams.get('ref');

  useEffect(() => {
    async function verifyPurchase() {
      if (!purchaseId || !firestore) {
        if (!purchaseId) setStatus('unauthorized');
        return;
      }

      try {
        const docRef = doc(firestore, 'purchases', purchaseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStatus('authorized');
          // Marca no banco que o cliente acessou a página de entrega
          updateDoc(docRef, { 
            accessed: true, 
            lastAccess: serverTimestamp() 
          }).catch(() => {});
        } else if (retryCount < 10) {
          setTimeout(() => setRetryCount(prev => prev + 1), 3000);
        } else {
          setStatus('unauthorized');
        }
      } catch (error) {
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Validando seu acesso...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <Card className="max-w-md w-full border-destructive/30 bg-destructive/5">
        <CardHeader className="text-center">
          <Lock className="mx-auto h-12 w-12 text-destructive mb-2" />
          <CardTitle>Acesso Pendente</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Não identificamos o seu pagamento. Se acabou de pagar, aguarde 1 minuto e atualize.</p>
          <Button onClick={() => window.location.reload()} className="w-full"><RefreshCcw className="mr-2 h-4 w-4" /> Atualizar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-xl animate-in fade-in duration-1000">
      <section className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Acesso Vitalício Liberado</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">ACESSO <span className="text-primary italic">CONCEDIDO!</span></h1>
      </section>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="bg-primary/5 border-b text-center py-10">
          <Download className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle>Download do Método</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <Button onClick={handleDownload} size="lg" className="w-full h-16 text-lg font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
            Baixar Agora
          </Button>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-green-500 font-bold uppercase">
            <CheckCircle2 className="h-3 w-3" /> Certificado de Autenticidade Ativo
          </div>
        </CardContent>
      </Card>
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
