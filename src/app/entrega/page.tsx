'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, ShieldCheck, CheckCircle2, Lock, Loader2, RefreshCcw, Search, AlertCircle, HelpCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

function EntregaContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'authorized' | 'unauthorized' | 'already_used'>('idle');
  const [purchaseId, setPurchaseId] = useState('');

  // Pega o ID inicial da URL se existir
  useEffect(() => {
    const urlId = searchParams.get('id') || searchParams.get('transaction_id') || searchParams.get('ref') || searchParams.get('tid');
    if (urlId) {
      setPurchaseId(urlId);
      verifyPurchase(urlId);
    }
  }, [searchParams, firestore]);

  async function verifyPurchase(idToVerify: string) {
    if (!idToVerify || !firestore) return;
    
    setStatus('loading');
    
    try {
      const docRef = doc(firestore, 'purchases', idToVerify.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Regra de Acesso Único: Se já foi acessado, bloqueia.
        if (data.accessed === true) {
          setStatus('already_used');
          toast({
            variant: "destructive",
            title: "Acesso Expirado",
            description: "Este código de transação já foi utilizado anteriormente.",
          });
          return;
        }

        // Se o status for aprovado e nunca foi acessado
        if (data.status) {
          setStatus('authorized');
          
          // Marca IMEDIATAMENTE como acessado para impedir segunda entrada
          updateDoc(docRef, { 
            accessed: true, 
            lastAccess: serverTimestamp() 
          }).catch((err) => {
            console.error("Erro ao marcar acesso:", err);
          });
          
          toast({
            title: "Acesso Liberado!",
            description: "Seu pagamento foi confirmado. Este é seu único acesso.",
          });
        } else {
          setStatus('unauthorized');
        }
      } else {
        setStatus('unauthorized');
        if (!searchParams.get('id')) {
           toast({
            variant: "destructive",
            title: "Acesso não encontrado",
            description: "Verifique o ID ou aguarde o processamento do pagamento.",
          });
        }
      }
    } catch (error) {
      setStatus('unauthorized');
    }
  }

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseId) return;
    verifyPurchase(purchaseId);
  };

  const handleDownload = () => {
    window.open('https://drive.google.com/file/d/14GPvzQOzMsub7hMpUdD-9blZ3WUVavJH/view?usp=sharing', '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div>
            <p className="text-foreground font-bold text-lg">Validando seu acesso único...</p>
            <p className="text-xs text-muted-foreground italic">Garantindo a segurança da sua transação.</p>
        </div>
      </div>
    );
  }

  if (status === 'already_used') {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Card className="border-destructive/50 shadow-2xl">
          <CardHeader className="text-center bg-destructive/5 pb-8">
            <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl font-black text-destructive">ACESSO EXPIRADO</CardTitle>
            <CardDescription className="text-foreground">
              Este código de transação já foi utilizado para realizar o download.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Por questões de segurança e exclusividade, cada compra permite apenas <b>um único acesso</b> à área de download.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-xs font-bold flex items-center justify-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Problemas com o acesso?
              </p>
              <p className="text-[10px] mt-2 text-muted-foreground">
                Se você não conseguiu baixar o arquivo na primeira tentativa, entre em contato com nosso suporte informando o ID: <span className="font-mono text-foreground">{purchaseId}</span>
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'authorized') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700">
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Acesso Único Confirmado</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">ACESSO <span className="text-primary italic">LIBERADO!</span></h1>
          <p className="text-muted-foreground font-medium">Atenção: Não feche esta página antes de concluir o download.</p>
        </section>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="bg-primary/5 border-b text-center py-10">
            <Download className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl">Download do Método</CardTitle>
            <CardDescription>Clique abaixo para baixar seu guia exclusivo.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Button onClick={handleDownload} size="lg" className="w-full h-16 text-lg font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Baixar Agora
            </Button>
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-green-500 font-bold uppercase">
              <CheckCircle2 className="h-3 w-3" /> Transação Segura e Exclusiva
            </div>
          </CardContent>
        </Card>
        <p className="text-center mt-6 text-[10px] text-muted-foreground">ID Verificado: {purchaseId}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in duration-500">
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-muted h-16 w-16 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black">ÁREA DE ACESSO</CardTitle>
            <CardDescription>Insira seu ID de transação (Acesso Único).</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleManualVerify} className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase ml-1">Código da Transação</p>
              <Input 
                placeholder="Ex: A1B2C3D4-..." 
                value={purchaseId}
                onChange={(e) => setPurchaseId(e.target.value)}
                className="h-12 text-center font-mono tracking-wider bg-muted/30"
              />
            </div>
            <Button type="submit" className="w-full h-12 font-bold uppercase" disabled={!purchaseId}>
              <Search className="mr-2 h-4 w-4" /> Liberar Acesso
            </Button>
          </form>
          
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">Importante:</span><br />
              O acesso ao link de download é permitido apenas <b>uma vez</b> por transação aprovada. Certifique-se de estar em uma conexão estável.
            </p>
          </div>

          {status === 'unauthorized' && (
            <div className="text-center pt-2 animate-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-destructive font-medium flex items-center justify-center gap-1">
                <RefreshCcw className="h-3 w-3" /> Pagamento não identificado.
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Verifique o código ou aguarde 1 minuto após a aprovação.</p>
            </div>
          )}
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
