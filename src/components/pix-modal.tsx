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
import { Loader2, Copy, Check, ShieldCheck, X, Download, Lock, Timer, CheckCircle2, ShieldCheck as ShieldIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
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
    return () => { if (interval) clearInterval(interval); };
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && status !== 'paid' && onClose()}>
      <DialogContent 
        className="sm:max-w-[400px] bg-[#0A0A0A] border-zinc-800 p-0 overflow-hidden flex flex-col gap-0 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogClose className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 opacity-80 hover:opacity-100 transition-opacity z-50 border border-white/10">
          <X className="h-4 w-4 text-white" />
        </DialogClose>

        {status !== 'paid' && (
          <div className="bg-red-600 text-white py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] shrink-0 border-b border-white/10">
            <Timer className="h-3.5 w-3.5" />
            VAGA DE REVISÃO EXPIRA EM: {formatTime(timeLeft)}
          </div>
        )}

        <div className="p-6 flex flex-col items-center gap-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-center text-xl font-black italic uppercase tracking-tighter text-white">
              {status === 'paid' ? 'ACESSO LIBERADO' : 'PAGAMENTO SEGURO'}
            </DialogTitle>
            <DialogDescription className="text-center text-[11px] font-medium text-zinc-400">
              {status === 'paid' 
                ? 'Seu pagamento foi aprovado! Baixe agora.' 
                : 'Pague o Pix para garantir sua vaga na revisão manual.'}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full flex flex-col items-center gap-5">
            {status === 'paid' ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 gap-6 w-full py-4">
                <div className="bg-green-500/10 p-6 rounded-full border-2 border-green-500/20">
                  <ShieldCheck className="h-16 w-16 text-green-500" />
                </div>
                <Button 
                  onClick={handleDownload} 
                  className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
                >
                  <Download className="mr-2 h-5 w-5" /> BAIXAR MÉTODO AGORA
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-white p-3 rounded-xl shadow-xl flex items-center justify-center border-4 border-zinc-900">
                  <QRCodeSVG value={pixData.pix.copyPaste} size={160} />
                </div>

                <div className="w-full space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="bg-primary/20 text-primary h-6 w-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0">1</div>
                      <p className="text-[11px] font-bold text-zinc-300 leading-tight">Copie o código ou escaneie o QR Code.</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="bg-primary/20 text-primary h-6 w-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0">2</div>
                      <p className="text-[11px] font-bold text-zinc-300 leading-tight">Abra o app do seu banco e pague via <span className="text-primary">Pix</span>.</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Valor do Método</p>
                      <p className="text-xl font-black italic text-white tracking-tighter">R$ {((pixData.transaction?.amount || 1990) / 100).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <ShieldIcon className="h-6 w-6 text-primary opacity-40" />
                  </div>

                  <Button 
                    onClick={copyPixCode} 
                    className="w-full h-14 font-black uppercase italic tracking-tighter text-base shadow-xl shadow-primary/20 bg-primary text-primary-foreground active:scale-95 transition-transform"
                  >
                    {isCopied ? <><Check className="mr-2 h-5 w-5" /> CÓDIGO COPIADO!</> : <><Copy className="mr-2 h-5 w-5" /> COPIAR CÓDIGO PIX</>}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Aguardando Confirmação</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-black/50 py-4 px-6 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-green-500 tracking-widest">
              <ShieldCheck className="h-3 w-3" /> Compra Segura
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-green-500 tracking-widest">
              <Lock className="h-3 w-3" /> SSL Certificado
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-green-500 tracking-widest">
              <CheckCircle2 className="h-3 w-3" /> Acesso Imediato
            </div>
          </div>
          <p className="text-[8px] text-center text-zinc-500 uppercase tracking-[0.05em] font-bold leading-tight">
            Ambiente 100% Criptografado. Suas informações estão seguras conosco.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
