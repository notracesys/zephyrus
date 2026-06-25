
'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useState } from 'react';
import PixModal from '@/components/pix-modal';
import { toast } from '@/hooks/use-toast';

export default function OfertaRecusadaPage() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  const handleCreatePix = async () => {
    setIsGeneratingPix(true);
    try {
      const response = await fetch('/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1990,
          customerName: 'Jogador FF',
          customerEmail: 'contato@zephyrus.com',
          siteId: sessionStorage.getItem('active_site_id') || 'global'
        })
      });

      const data = await response.json();
      if (data.success) {
        setPixData(data);
        setPixModalOpen(true);
        if (firestore) {
          addDoc(collection(firestore, 'checkoutClicks'), {
            timestamp: serverTimestamp(),
            source: 'oferta-recusada-pix-native',
            url: 'native-modal'
          });
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar Pix",
        description: "Não foi possível gerar o QR Code. Tente novamente.",
      });
    } finally {
      setIsGeneratingPix(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <PixModal 
        isOpen={pixModalOpen} 
        onClose={() => setPixModalOpen(false)} 
        pixData={pixData} 
      />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl space-y-8 animate-in fade-in-50 duration-1000">
            <Card className="border-destructive/50 shadow-lg shadow-destructive/10">
                <CardHeader className="items-center text-center p-6">
                    <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                    <CardTitle className="text-3xl font-headline">Você tem certeza?</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6 px-6 pb-8">
                    <p className="text-base text-muted-foreground">Você está prestes a tomar uma decisão que pode ser irreversível. Banimentos automáticos são como uma sentença de culpa.</p>
                    <p className="text-foreground text-base leading-relaxed">Quando você <span className="font-bold text-destructive">NÃO RECORRE</span>, o sistema entende que você está <span className="font-bold text-destructive">ACEITANDO A PUNIÇÃO</span>.</p>
                    <p className="font-bold text-lg text-primary animate-pulse">Não agir é a pior escolha. O tempo corre contra você.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button 
                            disabled={isGeneratingPix}
                            onClick={handleCreatePix} 
                            className="font-bold h-12 px-8"
                        >
                            {isGeneratingPix ? (
                              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> GERANDO PIX...</>
                            ) : (
                              <>
                                Me Arrependi, quero recuperar!
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Desistir e Perder a Conta
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
