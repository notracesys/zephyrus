'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2, PartyPopper, ArrowRight, User, Trophy, Star, Globe, Shield, Users, Clock, Flame } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';

const accountIdSchema = z.object({
  accountId: z.string()
    .min(5, { message: 'O ID deve ter pelo menos 5 dígitos.' })
    .max(15, { message: 'O ID deve ter no máximo 15 dígitos.' })
    .regex(/^\d+$/, { message: 'Insira apenas números.' }),
});

type AccountIdForm = z.infer<typeof accountIdSchema>;

interface PlayerData {
  nickname: string;
  account_id: string;
  level: string | number;
  region: string;
  guild_name?: string | null;
  guild_role?: string | null;
  last_active?: string | null;
  kills?: string | number | null;
  win_rate?: string | number | null;
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

  async function buscarContaFreeFire(uid: string): Promise<PlayerData> {
    const response = await fetch('/api/ff-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || "Não foi possível verificar a conta agora. Tente novamente.");
    }

    // Mapeamento baseado exatamente no JSON documentado da freefireapi.me
    const normalized: PlayerData = {
      nickname: json.name || 'N/A',
      account_id: json.uid || uid,
      level: json.level || '?',
      region: json.region || 'BR',
      guild_name: json.guild?.name || null,
      guild_role: json.guild?.role || null,
      last_active: json.last_active || null,
      kills: json.stats?.kills || null,
      win_rate: json.stats?.win_rate || null
    };

    return normalized;
  }

  const handleVerify = async (values: AccountIdForm) => {
    if (!values.accountId || values.accountId.trim() === '') {
      toast({
        variant: "destructive",
        title: "Aviso",
        description: "Digite um ID válido.",
      });
      return;
    }

    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    setPlayerData(null);

    try {
      const normalizedData = await buscarContaFreeFire(values.accountId);
      setPlayerData(normalizedData);
      setIsVerified(true);
      toast({
        title: "Sucesso",
        description: "Conta localizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in-50 duration-1000">
          <section className="text-center">
            <h1 className="font-headline text-3xl md:text-4xl font-bold">{t.verify_title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t.verify_subtitle}
            </p>
          </section>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t.id_label}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">{t.id_label}</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder={t.id_placeholder} 
                              {...field} 
                              className={cn(
                                "text-base", 
                                isVerified && "border-green-500"
                              )} 
                              disabled={isVerified || isVerifying}
                            />
                          </FormControl>
                          <Button 
                            type="submit" 
                            className={cn(
                              "px-8 font-bold min-w-[140px]",
                              isVerified && "bg-green-500 hover:bg-green-600 text-white"
                            )}
                            disabled={isVerifying || isVerified}
                          >
                            {isVerifying ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                <span>Verificando conta...</span>
                              </div>
                            ) : isVerified ? (
                              <ShieldCheck className="h-5 w-5" />
                            ) : 'Verificar'}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {isVerified && playerData && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
              <Card className="w-full border-green-500/20 bg-green-50/5 dark:bg-green-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <PartyPopper className="text-green-500" />
                    Conta Encontrada
                  </CardTitle>
                  <div className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">CONTA ATIVA</div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {playerData.nickname && playerData.nickname !== 'N/A' && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Nickname</p>
                        <p className="font-black truncate">{playerData.nickname}</p>
                      </div>
                    )}
                    {playerData.account_id && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> UID</p>
                        <p className="font-mono text-sm">{playerData.account_id}</p>
                      </div>
                    )}
                    {playerData.level && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Nível</p>
                        <p className="font-black">Nível {playerData.level}</p>
                      </div>
                    )}
                    {playerData.region && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Região</p>
                        <p className="font-black">{playerData.region}</p>
                      </div>
                    )}
                    {playerData.guild_name && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Guilda</p>
                        <p className="font-black truncate">{playerData.guild_name}</p>
                      </div>
                    )}
                    {playerData.guild_role && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Cargo</p>
                        <p className="font-black truncate uppercase text-[11px]">{playerData.guild_role}</p>
                      </div>
                    )}
                    {playerData.kills && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> Kills Totais</p>
                        <p className="font-black">{playerData.kills}</p>
                      </div>
                    )}
                    {playerData.win_rate && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Taxa de Vitória</p>
                        <p className="font-black">{playerData.win_rate}%</p>
                      </div>
                    )}
                    {playerData.last_active && (
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Última Atividade</p>
                        <p className="font-black text-[11px] truncate">{new Date(playerData.last_active).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center">
                  <p className="text-muted-foreground mb-4 text-center">Prossiga para a análise técnica</p>
                  <Button asChild size="lg" className="w-full md:w-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-12">
                     <Link href="/analysis">
                         Prosseguir
                         <ArrowRight className="ml-2 h-5 w-5" />
                     </Link>
                  </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
