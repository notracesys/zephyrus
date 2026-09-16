'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2, ArrowRight, User } from 'lucide-react';
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

export default function VerifyPage() {
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);

  const form = useForm<AccountIdForm>({
    resolver: zodResolver(accountIdSchema),
    defaultValues: { accountId: '' },
  });

  const handleVerify = async (values: AccountIdForm) => {
    const uid = values.accountId;
    
    if (!uid || uid.trim() === '') {
      toast({
        variant: "destructive",
        title: "Aviso",
        description: "Digite um ID válido.",
      });
      return;
    }

    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    setNickname(null);

    try {
      const response = await fetch(`https://wzapiinfo.vercel.app/get?uid=${uid}`);
      const data = await response.json();
      
      // Log do resultado bruto conforme solicitado
      console.log(data);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Tenta extrair o nickname da resposta (comumente 'name' ou 'nickname')
      const playerNickname = data.name || data.nickname || data.basicInfo?.name || data.basicinfo?.nickname || null;

      if (!playerNickname) {
        throw new Error('Player not found');
      }

      setNickname(playerNickname);
      setIsVerified(true);
      
      toast({
        title: "Sucesso",
        description: "Conta localizada com sucesso.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: "Não foi possível encontrar essa conta. Verifique o ID informado.",
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
                                <span>Verificando...</span>
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

          {isVerified && nickname && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
              <Card className="w-full border-green-500/20 bg-green-50/5 dark:bg-green-950/5">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <ShieldCheck className="h-8 w-8" />
                    <span className="text-xl font-black uppercase tracking-tighter">Conta Encontrada</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-muted-foreground flex items-center justify-center gap-1">
                      <User className="h-3 w-3" /> Nickname
                    </p>
                    <p className="text-3xl font-black italic text-foreground tracking-tighter">
                      {nickname}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col items-center">
                  <Button asChild size="lg" className="w-full md:w-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-12">
                     <Link href="/analysis">
                         Prosseguir para Análise
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
