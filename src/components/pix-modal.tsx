'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, ShieldCheck, AlertCircle, X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    transaction: {
      hash: string;
      status: string;
      amount: number;
    };
    pix: {
      copyPaste: string;
      qrCode?: string | null;
      expiresAt?: string;
    };
  } | null;
}

export default function PixModal({ isOpen, onClose, pixData }: PixModalProps) {
  const { t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && pixData?.transaction?.hash && status === 'pending') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/pix/status/${pixData.transaction.hash}`);
          const data = await res.json();
          if (data.status === 'paid') {
            setStatus('paid');
            clearInterval(interval);
            
            if (firestore) {
                const purchaseRef = doc(firestore, 'purchases', String(pixData.transaction.hash));
                updateDoc(purchaseRef, { 
                    status: 'paid',
                    paidAt: serverTimestamp()
                }).catch(() => {});
            }

            toast({
              title: "Pagamento Confirmado!",
              description: "Seu acesso foi liberado.",
            });
          }
        } catch (e) {
          console.error("Erro ao checar status do Pix:", e);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, pixData, status, router, firestore]);

  const copyPixCode = () => {
    if (!pixData?.pix?.copyPaste) return;
    navigator.clipboard.writeText(pixData.pix.copyPaste);
    setIsCopied(true);
    toast({
      title: "Código Copiado!",
      description: "Cole no seu aplicativo do banco para pagar.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    window.open('https://drive.google.com/file/d/1WqGgkgiu-YiMhAGfTkNRJ5B-HJg9ykxQ/view?usp=sharing', '_blank');
  };

  if (!pixData) return null;

  const hasPixCode = !!pixData.pix?.copyPaste;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md bg-card border-primary/20"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black italic uppercase tracking-tighter">
            {status === 'paid' ? 'ACESSO LIBERADO!' : 'PAGAMENTO VIA PIX'}
          </DialogTitle>
          <DialogDescription className="text-center font-medium">
            {status === 'paid' 
              ? 'Clique no botão abaixo para baixar o seu método.' 
              : hasPixCode
                ? 'Escaneie o QR Code abaixo ou copie o código Pix.'
                : 'Aguardando dados de pagamento...'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {status === 'paid' ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-500 space-y-6 w-full">
              <div className="bg-green-500/10 p-6 rounded-full border-2 border-green-500/30">
                <ShieldCheck className="h-20 w-20 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-green-500 uppercase tracking-tighter italic text-xl">Pagamento Confirmado</p>
                <p className="text-sm text-muted-foreground mt-1">Seu download está pronto.</p>
              </div>
              <Button 
                onClick={handleDownload} 
                size="lg" 
                className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] transition-transform"
              >
                <Download className="mr-2 h-6 w-6" /> {t.delivery_download_btn}
              </Button>
            </div>
          ) : !hasPixCode ? (
            <div className="flex flex-col items-center text-center p-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm font-bold">Não foi possível exibir o PIX. Tente novamente.</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl border shadow-xl flex items-center justify-center">
                 <QRCodeSVG value={pixData.pix.copyPaste} size={200} />
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Valor a pagar:</span>
                  <span className="text-lg font-black italic text-foreground">R$ {((pixData.transaction?.amount || 1990) / 100).toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="relative">
                  <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 break-all text-[10px] font-mono leading-relaxed h-24 overflow-y-auto pr-10">
                    {pixData.pix.copyPaste}
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={copyPixCode}
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <Button onClick={copyPixCode} className="w-full h-14 font-black uppercase italic tracking-tighter text-lg shadow-xl shadow-primary/20">
                  {isCopied ? <><Check className="mr-2 h-5 w-5" /> Copiado!</> : <><Copy className="mr-2 h-5 w-5" /> Copiar Código Pix</>}
                </Button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Aguardando pagamento...</span>
                </div>
                <p className="text-[10px] text-center text-muted-foreground max-w-[250px]">
                  Após o pagamento, sua compra será confirmada automaticamente.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2 pb-2 pt-4 border-t">
          <ShieldCheck className="h-3 w-3" /> Transação Segura via IronPay
        </div>
      </DialogContent>
    </Dialog>
  );
}
