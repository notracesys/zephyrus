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
import { Loader2, Copy, Check, ShieldCheck, AlertCircle, X, Download, Lock, Timer, CheckCircle2, ArrowRight, ShieldAlert, ShieldCheck as ShieldIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

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
  const [timeLeft, setTimeLeft] = useState(600);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isOpen || status === 'paid') return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              description: "Seu acesso foi liberado com sucesso.",
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
  }, [isOpen, pixData, status, firestore]);

  const copyPixCode = () => {
    if (!pixData?.pix?.copyPaste) return;
    navigator.clipboard.writeText(pixData.pix.copyPaste);
    setIsCopied(true);
    toast({
      title: "Código Copiado!",
      description: "Cole no seu aplicativo do banco para finalizar.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    window.open('https://drive.google.com/file/d/1WqGgkgiu-YiMhAGfTkNRJ5B-HJg9ykxQ/view?usp=sharing', '_blank');
  };

  if (!pixData) return null;

  const hasPixCode = !!pixData.pix?.copyPaste;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && status !== 'paid' && onClose()}>
      <DialogContent 
        className="sm:max-w-md bg-card border-primary/30 shadow-[0_0_50px_-12px_rgba(255,204,0,0.2)] p-0 overflow-hidden flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogClose className="absolute right-4 top-4 rounded-full bg-background/80 p-2 opacity-100 transition-all hover:bg-background shadow-lg z-50">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        {status !== 'paid' && (
          <div className="bg-primary text-primary-foreground py-2 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest animate-pulse shrink-0">
            <Timer className="h-3 w-3" />
            VAGA DE REVISÃO EXPIRA EM: {formatTime(timeLeft)}
          </div>
        )}

        <div className="overflow-y-auto max-h-[80vh] custom-scrollbar p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-center text-2xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-2">
              {status === 'paid' ? (
                <span className="text-green-500 flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="h-6 w-6" /> ACESSO LIBERADO
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> PAGAMENTO SEGURO
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-foreground/80 mt-2">
              {status === 'paid' 
                ? 'Sucesso! Clique abaixo para baixar seu método agora.' 
                : 'Pague o Pix para garantir sua vaga na revisão manual agora.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-6">
            {status === 'paid' ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 space-y-6 w-full py-4">
                <div className="bg-green-500/10 p-8 rounded-full border-4 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <ShieldCheck className="h-20 w-20 text-green-500" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-black text-green-500 uppercase tracking-tighter italic text-2xl">PAGAMENTO APROVADO!</p>
                  <p className="text-sm text-muted-foreground">O sistema de revisão humana foi ativado.</p>
                </div>
                <Button 
                  onClick={handleDownload} 
                  size="lg" 
                  className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
                >
                  <Download className="mr-2 h-6 w-6" /> BAIXAR MÉTODO AGORA
                </Button>
              </div>
            ) : !hasPixCode ? (
              <div className="flex flex-col items-center text-center p-8 space-y-4">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <p className="text-sm font-bold">Erro de conexão segura. Tente gerar novamente.</p>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white p-4 rounded-xl border shadow-2xl flex items-center justify-center">
                    <QRCodeSVG value={pixData.pix.copyPaste} size={180} />
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 transition-all hover:bg-muted/80">
                      <div className="bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</div>
                      <p className="text-xs font-bold leading-tight">Copie o código ou escaneie o QR Code.</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 transition-all hover:bg-muted/80">
                      <div className="bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</div>
                      <p className="text-xs font-bold leading-tight">Abra o app do seu banco e pague via <span className="text-primary">Pix</span>.</p>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Valor do Método</p>
                      <p className="text-2xl font-black italic text-foreground tracking-tighter">R$ {((pixData.transaction?.amount || 1990) / 100).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="text-right">
                       <ShieldIcon className="h-8 w-8 text-primary ml-auto opacity-50" />
                    </div>
                  </div>

                  <Button 
                    onClick={copyPixCode} 
                    className="w-full h-14 font-black uppercase italic tracking-tighter text-lg shadow-2xl shadow-primary/30 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    {isCopied ? <><Check className="mr-2 h-5 w-5" /> CÓDIGO COPIADO!</> : <><Copy className="mr-2 h-5 w-5" /> COPIAR CÓDIGO PIX</>}
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-3 w-full pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Aguardando Confirmação do Banco</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-muted/50 py-4 px-6 border-t mt-auto shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground tracking-widest">
              <ShieldCheck className="h-3 w-3 text-green-500" /> Compra Segura
            </div>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground tracking-widest">
              <Lock className="h-3 w-3 text-green-500" /> SSL Certificado
            </div>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground tracking-widest">
              <CheckCircle2 className="h-3 w-3 text-green-500" /> Acesso Imediato
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 grayscale opacity-40 hover:opacity-100 transition-opacity duration-300">
             <img src="https://logodownload.org/wp-content/uploads/2020/11/pix-bc-logo.png" alt="Pix" className="h-4" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Norton_LifeLock_logo.svg/1200px-Norton_LifeLock_logo.svg.png" alt="Norton" className="h-3" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/McAfee_logo.svg/1200px-McAfee_logo.svg.png" alt="McAfee" className="h-3" />
          </div>
          <p className="text-[8px] text-center text-muted-foreground uppercase tracking-[0.1em] font-medium leading-tight">
            Ambiente 100% Criptografado. Suas informações estão seguras conosco.<br/>
            Processado com tecnologia IronPay®.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}