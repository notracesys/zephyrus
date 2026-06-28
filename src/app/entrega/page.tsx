'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, ShieldCheck, CheckCircle2, Lock, Loader2, RefreshCcw, Search, AlertCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

function EntregaContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'authorized' | 'unauthorized' | 'already_used'>('idle');
  const [purchaseId, setPurchaseId] = useState('');

  useEffect(() => {
    const urlId = searchParams.get('id') || searchParams.get('transaction_id') || searchParams.get('ref') || searchParams.get('tid');
    if (urlId) {
      setPurchaseId(urlId);
      verifyPurchase(urlId);
    }
  }, [searchParams, firestore]);

  async function verifyPurchase(idToVerify: string) {
    if (!idToVerify || !firestore) return;
    
    const cleanId = idToVerify.trim();
    setStatus('loading');
    
    try {
      const docRef = doc(firestore, 'purchases', cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.accessed === true) {
          setStatus('already_used');
          return;
        }

        if (data.status) {
          setStatus('authorized');
          
          updateDoc(docRef, { 
            accessed: true, 
            lastAccess: serverTimestamp(),
            accessIp: 'client-side-validated' 
          }).catch((err) => {
            console.warn("Error marking access:", err);
          });
          
          toast({
            title: "Access Released!",
            description: "Your payment has been confirmed.",
          });
        } else {
          setStatus('unauthorized');
        }
      } else {
        setStatus('unauthorized');
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus('unauthorized');
    }
  }

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseId) return;
    verifyPurchase(purchaseId);
  };

  const handleDownload = () => {
    window.open('https://drive.google.com/file/d/1WqGgkgiu-YiMhAGfTkNRJ5B-HJg9ykxQ/view?usp=sharing', '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'already_used') {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Card className="border-destructive/50 shadow-2xl">
          <CardHeader className="text-center bg-destructive/5 pb-8">
            <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl font-black text-destructive uppercase">{t.delivery_expired}</CardTitle>
            <CardDescription className="text-foreground">
              {t.delivery_expired_desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t.delivery_expired_help}
            </p>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-xs font-bold flex items-center justify-center gap-2">
                ID: <span className="font-mono text-foreground">{purchaseId}</span>
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
              Home
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
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">{t.delivery_authorized}</h1>
          <p className="text-muted-foreground font-medium">{t.delivery_authorized_subtitle}</p>
        </section>

        <Card className="border-primary/20 bg-card shadow-2xl">
          <CardHeader className="bg-primary/5 border-b text-center py-10">
            <Download className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl">Download</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Button onClick={handleDownload} size="lg" className="w-full h-16 text-lg font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
              {t.delivery_download_btn}
            </Button>
          </CardContent>
        </Card>
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
            <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">{t.delivery_title}</CardTitle>
            <CardDescription>{t.delivery_subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleManualVerify} className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder={t.delivery_placeholder} 
                value={purchaseId}
                onChange={(e) => setPurchaseId(e.target.value)}
                className="h-12 text-center font-mono tracking-wider bg-muted/30"
              />
            </div>
            <Button type="submit" className="w-full h-12 font-bold uppercase" disabled={!purchaseId}>
              <Search className="mr-2 h-4 w-4" /> {t.delivery_btn}
            </Button>
          </form>
          
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t.delivery_important}
            </p>
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
