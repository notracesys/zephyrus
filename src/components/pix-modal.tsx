'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    hash: string;
    pixCode: string;
    qrCodeImage?: string;
    amount: number;
  } | null;
}

export default function PixModal({ isOpen, onClose, pixData }: PixModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && pixData?.hash && status === 'pending') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/pix/status/${pixData.hash}`);
          const data = await res.json();
          if (data.status === 'paid') {
            setStatus('paid');
            clearInterval(interval);
            
            if (firestore) {
                const purchaseRef = doc(firestore, 'purchases', String(pixData.hash));
                updateDoc(purchaseRef, { 
                    status: 'paid',
                    paidAt: serverTimestamp()
                }).catch(() => {});
            }

            toast({
              title: "Pagamento Confirmado!",
              description: "Redirecionando para sua entrega...",
            });
            setTimeout(() => {
              router.push(`/entrega?id=${pixData.hash}`);
            }, 2000);
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
    if (!pixData?.pixCode) return;
    navigator.clipboard.writeText(pixData.pixCode);
    setIsCopied(true);
    toast({
      title: "Código Copiado!",
      description: "Cole no seu aplicativo do banco para pagar.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!pixData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black italic uppercase tracking-tighter">
            {status === 'paid' ? 'PAGAMENTO APROVADO!' : 'FINALIZE SEU PAGAMENTO'}
          </DialogTitle>
          <DialogDescription className="text-center font-medium">
            {status === 'paid' 
              ? 'Sua conta está sendo processada para recuperação.' 
              : 'Escaneie o QR Code abaixo ou copie o código Pix.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {status === 'paid' ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="bg-green-500/10 p-6 rounded-full border-2 border-green-500/30 mb-4">
                <ShieldCheck className="h-20 w-20 text-green-500" />
              </div>
              <p className="font-bold text-green-500">SISTEMA LIBERADO</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl border shadow-xl">
                {pixData.qrCodeImage ? (
                  <img 
                    src={pixData.qrCodeImage.startsWith('data:') ? pixData.qrCodeImage : `data:image/png;base64,${pixData.qrCodeImage}`} 
                    alt="QR Code Pix" 
                    className="w-48 h-48 object-contain" 
                  />
                ) : (
                  <QRCodeSVG value={pixData.pixCode} size={200} />
                )}
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Valor a pagar:</span>
                  <span className="text-lg font-black italic text-primary">R$ {(pixData.amount / 100).toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="relative">
                  <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 break-all text-[10px] font-mono leading-relaxed h-24 overflow-y-auto">
                    {pixData.pixCode}
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute top-1 right-1 h-8 w-8"
                    onClick={copyPixCode}
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <Button onClick={copyPixCode} className="w-full h-14 font-black uppercase italic tracking-tighter text-lg shadow-xl shadow-primary/20">
                  {isCopied ? <><Check className="mr-2 h-5 w-5" /> COPIADO!</> : <><Copy className="mr-2 h-5 w-5" /> COPIAR CÓDIGO PIX</>}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Aguardando pagamento...</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck className="h-3 w-3" /> Transação Segura via IronPay
        </div>
      </DialogContent>
    </Dialog>
  );
}
