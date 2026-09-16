'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2, PartyPopper, ArrowRight, User, Trophy, Star, Globe, Shield, Users } from 'lucide-react';
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
  likes: string | number;
  rank?: string | number;
  guild_name?: string;
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

  /**
   * Busca dados da conta normalizando os campos da LK API
   */
  async function buscarContaFreeFire(uid: string): Promise<PlayerData> {
    const response = await fetch('/api/ff-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao consultar servidor de dados.');
    }

    // A LK API retorna os dados dentro de 'basicinfo'
    const base = data.basicinfo || data.basicInfo || data;
    
    // Normalização agressiva para suportar variações de nomes de campos (PascalCase vs camelCase)
    const normalized: PlayerData = {
      nickname: base.AccountName || base.nickname || base.account_name || 'N/A',
      account_id: base.AccountID || base.accountId || base.account_id || uid,
      level: base.AccountLevel || base.level || base.account_level || '?',
      region: base.AccountRegion || base.region || 'BR',
      likes: base.AccountLikes || base.liked || base.likes || 0,
      rank: base.RankName || base.rank_name || base.rank || 'N/A',
      guild_name: data.guildInfo?.GuildName || data.guildInfo?.guildName || null,
    };

    // Limpeza de campos vazios ou strings "null" retornadas pela API
    Object.keys(normalized).forEach(key => {
      const k = key as keyof PlayerData;
      if (normalized[k] === undefined || normalized[k] === null || normalized[k] === '' || normalized[k] === 'null') {
        if (k !== 'likes') delete normalized[k];
      }
    });

    return normalized;
  }

  const handleVerify = async (values: AccountIdForm) => {
    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    setPlayerData(null);

    try {
      const normalizedData = await buscarContaFreeFire(values.accountId);
      setPlayerData(normalizedData);
      setIsVerified(true);
      toast({
        title: "Sucesso",
        description: `${normalizedData.nickname} localizado com sucesso.`,
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
                              isVerified && "bg-green-500 hover:bg-green-600"
                            )}
                            disabled={isVerifying || isVerified}
                          >
                            {isVerifying ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                <span>{t.verifying || 'Verificando...'}</span>
                              </div>
                            ) : isVerified ? (
                              <ShieldCheck />
                            ) : (t.verify_btn || 'Verificar')}
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
              <Card className="w-full border-green-500/20 bg-green-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <PartyPopper className="text-green-500" />
                    {t.verified || 'Conta Encontrada'}!
                  </CardTitle>
                  <div className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">CONTA ATIVA</div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {playerData.nickname && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {t.player_nickname || 'Nickname'}</p>
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
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> {t.player_level || 'Nível'}</p>
                        <p className="font-black">Nível {playerData.level}</p>
                      </div>
                    )}
                    {playerData.region && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> {t.player_region || 'Região'}</p>
                        <p className="font-black">{playerData.region}</p>
                      </div>
                    )}
                    {playerData.likes !== undefined && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">👍 {t.player_likes || 'Likes'}</p>
                        <p className="font-black">{playerData.likes}</p>
                      </div>
                    )}
                    {playerData.rank && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> {t.player_rank || 'Patente'}</p>
                        <p className="font-black text-primary">{playerData.rank}</p>
                      </div>
                    )}
                    {playerData.guild_name && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {t.player_guild || 'Guilda'}</p>
                        <p className="font-black truncate">{playerData.guild_name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center">
                  <p className="text-muted-foreground mb-4 text-center">{t.proceed || 'Prossiga para a análise técnica'}</p>
                  <Button asChild size="lg" className="w-full md:w-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-12">
                     <Link href="/analysis">
                         {t.proceed || 'Prosseguir'}
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
