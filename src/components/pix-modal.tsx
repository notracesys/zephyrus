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
import { Loader2, Copy, Check, ShieldCheck, Download, Lock, Timer, CheckCircle2, ShieldCheck as ShieldIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
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
        className="sm:max-w-[400px] bg-[#0A0A0A] border-zinc-800 p-0 overflow-hidden flex flex-col gap-0 shadow-2xl rounded-[2.5rem] sm:rounded-[2.5rem]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {status !== 'paid' && (
          <div className="bg-red-600 text-white py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shrink-0 border-b border-white/10">
            <Timer className="h-4 w-4" />
            VAGA DE REVISÃO EXPIRA EM: {formatTime(timeLeft)}
          </div>
        )}

        <div className="p-8 flex flex-col items-center gap-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-center text-2xl font-black italic uppercase tracking-tighter text-white">
              {status === 'paid' ? 'ACESSO LIBERADO' : 'PAGAMENTO SEGURO'}
            </DialogTitle>
            <DialogDescription className="text-center text-[12px] font-medium text-zinc-400">
              {status === 'paid' 
                ? 'Seu pagamento foi aprovado! Clique para baixar.' 
                : 'Pague o Pix para garantir sua vaga na revisão manual.'}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full flex flex-col items-center gap-6">
            {status === 'paid' ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 gap-6 w-full py-4">
                <div className="bg-green-500/10 p-8 rounded-full border-2 border-green-500/20">
                  <ShieldCheck className="h-20 w-20 text-green-500" />
                </div>
                <Button 
                  onClick={handleDownload} 
                  className="w-full h-16 text-base font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] transition-all rounded-2xl"
                >
                  <Download className="mr-2 h-6 w-6" /> BAIXAR MÉTODO AGORA
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-3xl shadow-xl flex items-center justify-center border-[6px] border-zinc-900">
                  <QRCodeSVG value={pixData.pix.copyPaste} size={180} />
                </div>

                <div className="w-full space-y-4">
                  <div className="bg-zinc-900/80 p-5 rounded-3xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Valor do Método</p>
                      <p className="text-2xl font-black italic text-white tracking-tighter">R$ {((pixData.transaction?.amount || 1990) / 100).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <ShieldIcon className="h-7 w-7 text-primary opacity-50" />
                  </div>

                  <Button 
                    onClick={copyPixCode} 
                    className="w-full h-16 font-black uppercase italic tracking-tighter text-lg shadow-xl shadow-primary/20 bg-primary text-primary-foreground active:scale-95 transition-transform rounded-2xl"
                  >
                    {isCopied ? <><Check className="mr-2 h-6 w-6" /> COPIADO!</> : <><Copy className="mr-2 h-6 w-6" /> COPIAR CÓDIGO PIX</>}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Aguardando Confirmação</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-black/50 py-5 px-8 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex justify-between gap-4 opacity-80">
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
          <p className="text-[9px] text-center text-zinc-500 uppercase tracking-tight font-bold leading-tight">
            Ambiente 100% Criptografado. Suas informações estão seguras.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
