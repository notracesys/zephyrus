'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2, ArrowRight, User, Star, ThumbsUp, Globe, Zap } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

const accountIdSchema = z.object({
  accountId: z.string()
    .min(5, { message: 'ID Inválido' })
    .max(15, { message: 'ID Inválido' })
    .regex(/^\d+$/, { message: 'Somente números' }),
});

type AccountIdForm = z.infer<typeof accountIdSchema>;

interface PlayerData {
  nickname: string;
  accountId: string | number;
  level: string | number;
  region: string;
  likes: string | number;
}

export default function VerifyPage() {
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  const form = useForm<AccountIdForm>({
    resolver: zodResolver(accountIdSchema),
    defaultValues: { accountId: '' },
  });

  const handleVerify = (values: AccountIdForm) => {
    const uid = values.accountId;
    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    setPlayerData(null);

    // Simulação imediata de verificação sem API externa
    setTimeout(() => {
      setPlayerData({
        nickname: `Player_${uid.slice(-4)}`,
        accountId: uid,
        level: String(Math.floor(Math.random() * (80 - 40) + 40)),
        region: 'BR',
        likes: String(Math.floor(Math.random() * 5000))
      });
      setIsVerified(true);
      setIsVerifying(false);
    }, 1500); // Delay curto para manter a percepção de processamento técnico
  };

  return (
    <div className="flex min-h-full flex-col bg-[#050505] text-white selection:bg-[#ff00b8]/30 overflow-x-hidden relative">
      {/* Camadas de Fundo Cyberpunk */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ff00b8]/5 blur-[120px] rounded-full" />
        <div className="absolute -left-20 top-1/4 w-[300px] h-[600px] bg-[#ff00b8]/5 -rotate-45 blur-[100px]" />
        <div className="absolute -right-20 top-1/4 w-[300px] h-[600px] bg-[#ff00b8]/5 rotate-45 blur-[100px]" />
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
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="flex items-center gap-1">
                   <div className="w-1 h-3 bg-[#ff00b8]" />
                   <div className="w-1 h-3 bg-[#ff00b8]" />
                   <div className="w-1 h-3 bg-[#ff00b8]" />
                   <span className="text-[8px] font-bold ml-1">01</span>
                </div>
              </div>

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
                            <div className="relative group">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#ff00b8] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <Input 
                                  placeholder="Insira o ID do jogador aqui" 
                                  {...field} 
                                  className="h-16 bg-black/40 border-zinc-800 rounded-xl focus-visible:ring-[#ff00b8] focus-visible:border-[#ff00b8] text-center font-mono tracking-[0.2em] text-xl font-black placeholder:font-sans placeholder:tracking-normal placeholder:text-zinc-700 placeholder:text-sm border-2 transition-all" 
                                  disabled={isVerifying}
                                />
                            </div>
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
                          <span>Verificando conta...</span>
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
                    <CardContent className="p-8 space-y-8">
                        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-zinc-800/50">
                            <div className="bg-green-500/10 p-5 rounded-full border border-green-500/30 mb-2 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]">
                                <ShieldCheck className="h-12 w-12 text-green-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 animate-pulse">Conta encontrada</span>
                            <h2 className="text-3xl font-bold tracking-tight text-white px-6 py-3 rounded-2xl bg-black/40 border border-zinc-800 shadow-inner">
                                {playerData?.nickname}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 font-body">
                            {[
                                { label: 'Nickname', value: playerData?.nickname, icon: User, color: 'text-[#ff00b8]' },
                                { label: 'UID', value: playerData?.accountId, icon: Zap, color: 'text-[#ff00b8]' },
                                { label: 'Nível', value: playerData?.level, icon: Star, color: 'text-[#ff00b8]' },
                                { label: 'Região', value: playerData?.region, icon: Globe, color: 'text-[#ff00b8]' },
                                { label: 'Likes', value: playerData?.likes, icon: ThumbsUp, color: 'text-[#ff00b8]' }
                            ].map((stat, i) => (
                                stat.value ? (
                                    <div key={i} className="bg-black/50 p-4 rounded-xl border border-zinc-800/80 flex items-center justify-between transition-transform hover:scale-[1.01]">
                                        <div className="flex items-center gap-3">
                                            <div className={stat.color}>
                                                <stat.icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-400">{stat.label}:</span>
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-100">{stat.value}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col items-center pt-4">
                    <Button asChild className="w-full h-16 bg-gradient-to-r from-[#ff00b8] to-[#d40099] hover:from-[#d40099] hover:to-[#ff00b8] text-white font-black italic text-xl uppercase tracking-tighter rounded-full shadow-[0_10px_30px_-5px_rgba(255,0,184,0.5)] transition-all hover:scale-[1.03]">
                        <Link href="/analysis">
                            Iniciar Análise
                            <ArrowRight className="ml-3 h-6 w-6 stroke-[3]" />
                        </Link>
                    </Button>
                </div>
            </div>
          )}

          <div className="pt-8 flex items-center justify-center gap-8 opacity-40">
             <div className="h-[1px] w-12 bg-zinc-800" />
             <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                <ShieldCheck className="h-4 w-4" />
                Conexão Segura
             </div>
             <div className="h-[1px] w-12 bg-zinc-800" />
          </div>
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent opacity-50 shadow-[0_0_20px_rgba(255,0,184,0.8)]" />
    </div>
  );
}
