
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Lock, CreditCard, Loader2, Timer, CheckCircle2, Shield, Zap, ArrowRight, UserCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useAppConfig } from '@/components/config-provider';
import { toast } from '@/hooks/use-toast';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  document: z.string().min(11, 'Documento inválido'),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const config = useAppConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      document: '',
    },
  });

  const onSubmit = async (data: CheckoutValues) => {
    setIsLoading(true);
    // Simulação de processamento - em produção isso chamaria sua API de pagamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Dados Processados",
        description: "Redirecionando para o pagamento seguro...",
      });
      // window.location.href = lang === 'pt' ? config.checkoutUrlPt : config.checkoutUrlEnEs;
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lado Esquerdo: Formulário */}
          <div className="lg:col-span-7 space-y-6">
            <section className="space-y-2 mb-6">
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                    {t.checkout_title}
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                    {t.checkout_subtitle}
                </p>
            </section>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                    <Timer className="h-4 w-4" />
                    {t.checkout_timer_text}
                </div>
                <span className="font-mono text-lg font-bold text-primary">{formatTime(timeLeft)}</span>
            </div>

            <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                            <UserCircle2 className="text-primary h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight italic">Dados de Acesso</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.checkout_name}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome completo" {...field} className="h-14 bg-muted/20 border-border/50 text-lg rounded-xl focus:ring-primary" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.checkout_email}</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="seu@email.com" {...field} className="h-14 bg-muted/20 border-border/50 text-lg rounded-xl focus:ring-primary" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="document"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.checkout_doc}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="000.000.000-00" {...field} className="h-14 bg-muted/20 border-border/50 text-lg rounded-xl focus:ring-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.checkout_phone}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(00) 00000-0000" {...field} className="h-14 bg-muted/20 border-border/50 text-lg rounded-xl focus:ring-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-20 text-xl md:text-2xl font-black uppercase italic tracking-tighter bg-primary text-primary-foreground hover:scale-[1.01] transition-all shadow-xl shadow-primary/20 rounded-2xl relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="animate-spin h-6 w-6" />
                                        <span>PROCESSANDO...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span>{t.checkout_btn}</span>
                                        <ArrowRight className="h-7 w-7" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck className="h-4 w-4 text-green-500" /> {t.checkout_secure}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Lock className="h-4 w-4 text-green-500" /> SSL Criptografado
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <CreditCard className="h-4 w-4 text-green-500" /> Pagamento Garantido
                </div>
            </div>
          </div>

          {/* Lado Direito: Resumo do Pedido */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
             <Card className="border-primary/20 bg-card/30 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-primary/10 border-b border-primary/10 p-6">
                    <CardTitle className="text-lg font-black italic uppercase tracking-widest text-primary flex items-center justify-between">
                        {t.checkout_summary}
                        <Zap className="h-5 w-5 fill-primary" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between pb-6 border-b border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-primary/20 rounded-2xl border-2 border-primary/30 flex items-center justify-center shadow-inner">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-black italic text-lg uppercase leading-none tracking-tighter">{t.checkout_product}</p>
                                <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">Acesso Imediato • Estratégia VIP</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xl font-black italic text-white tracking-tighter">
                                R$ {lang === 'pt' ? '29,90' : '9.90'}
                             </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Subtotal</p>
                            <p className="font-bold text-zinc-300">R$ {lang === 'pt' ? '29,90' : '9.90'}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-green-500 text-sm font-black uppercase tracking-widest">Desconto Aplicado</p>
                            <p className="font-black text-green-500">- R$ 0,00</p>
                        </div>
                        <div className="h-px bg-zinc-800 w-full" />
                        <div className="flex justify-between items-center py-2">
                            <p className="text-white text-lg font-black uppercase tracking-widest">{t.checkout_total}</p>
                            <p className="text-3xl font-black italic text-primary tracking-tighter shadow-primary/20 drop-shadow-2xl">
                                R$ {lang === 'pt' ? '29,90' : '9.90'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 rounded-2xl p-6 space-y-4 border border-zinc-800">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Acesso liberado no e-mail logo após a confirmação do pagamento.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Suporte exclusivo via WhatsApp para dúvidas no processo de recuperação.
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] animate-pulse">
                            157 pessoas comprando isso agora
                        </p>
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
