'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2, ArrowRight, User, Zap, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import Link from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { LoadingSpinnerAvatar } from '@/components/loading-spinner-avatar';

const accountIdSchema = z.object({
  accountId: z.string()
    .min(5, { message: 'ID Inválido' })
    .max(15, { message: 'ID Inválido' })
    .regex(/^\d+$/, { message: 'Somente números' }),
});

type AccountIdForm = z.infer<typeof accountIdSchema>;

export default function VerifyPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const form = useForm<AccountIdForm>({
    resolver: zodResolver(accountIdSchema),
    defaultValues: { accountId: '' },
  });

  const handleVerify = (values: AccountIdForm) => {
    if (isVerified || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerified(true);
      setIsVerifying(false);
    }, 1200); 
  };

  const handleStartAnalysis = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      router.push('/analysis');
    }, 1000);
  };

  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <LoadingSpinnerAvatar size="lg" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
            Iniciando Protocolo de Análise...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[#050505] text-white selection:bg-[#ff00b8]/30 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ff00b8]/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(#ff00b8 1px, transparent 1px), linear-gradient(90deg, #ff00b8 1px, transparent 1px)', backgroundSize: '50px 50px' }} 
        />
      </div>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-[500px] space-y-10">
          <section className="text-center space-y-4 animate-in fade-in duration-1000">
            <h1 className="font-black italic text-5xl md:text-7xl tracking-tighter uppercase leading-[0.8] drop-shadow-[0_0_15px_rgba(255,0,184,0.4)]">
              Verificar <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ff00b8]">Conta</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm md:text-base tracking-tight max-w-[300px] mx-auto">
              Insira o ID da sua conta para dar o primeiro passo.
            </p>
          </section>

          {!isVerified ? (
            <Card className="bg-[#0f0f0f]/80 border-[#ff00b8]/20 backdrop-blur-xl rounded-[2rem] shadow-[0_0_50px_-15px_rgba(255,0,184,0.3)] border-t-[#ff00b8]/40 relative overflow-hidden group animate-in zoom-in-95 duration-500">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#ff00b8]/20 p-2 rounded-lg border border-[#ff00b8]/30">
                        <User className="h-5 w-5 text-[#ff00b8]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">ID do Jogador</span>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Insira o ID do jogador aqui" 
                              {...field} 
                              className="h-16 bg-black/40 border-zinc-800 rounded-xl focus-visible:ring-[#ff00b8] focus-visible:border-[#ff00b8] text-center font-mono tracking-[0.2em] text-xl font-black border-2 transition-all" 
                              disabled={isVerifying}
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff00b8] text-[10px] font-black uppercase text-center mt-2" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-gradient-to-r from-[#ff00b8] to-[#d40099] hover:from-[#d40099] hover:to-[#ff00b8] text-white font-black italic text-xl uppercase tracking-tighter rounded-xl shadow-[0_8px_20px_-5px_rgba(255,0,184,0.5)] active:translate-y-1 transition-all group overflow-hidden"
                      disabled={isVerifying}
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                      {isVerifying ? (
                        <div className="flex items-center gap-3 justify-center w-full">
                          <Loader2 className="animate-spin h-6 w-6" />
                          <span>Verificando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full px-6">
                          <span className="flex-grow text-center">Buscar</span>
                          <ArrowRight className="h-6 w-6 stroke-[3]" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
                <Card className="w-full border-[#ff00b8]/30 bg-[#0f0f0f]/90 backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(255,0,184,0.4)] rounded-[2.5rem] border-t-[#ff00b8]/50 overflow-hidden">
                    <CardContent className="p-12 space-y-8 flex flex-col items-center text-center">
                        <div className="mb-2">
                            <LoadingSpinnerAvatar size="lg" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                            Conta Encontrada
                          </h2>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col items-center pt-4">
                    <Button 
                      onClick={handleStartAnalysis}
                      className="w-full h-16 bg-gradient-to-r from-[#ff00b8] to-[#d40099] hover:from-[#d40099] hover:to-[#ff00b8] text-white font-black italic text-xl uppercase tracking-tighter rounded-full shadow-[0_10px_30px_-5px_rgba(255,0,184,0.5)] transition-all hover:scale-[1.03]"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Iniciar Análise
                            <ArrowRight className="h-6 w-6 stroke-[3]" />
                        </span>
                    </Button>
                </div>
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent opacity-50 shadow-[0_0_20px_rgba(255,0,184,0.8)]" />
    </div>
  );
}
