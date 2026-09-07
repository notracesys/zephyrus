'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Check, ShieldCheck, Lock, Terminal, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  addOffer: z.boolean().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      addOffer: false,
    },
  });

  const onSubmit = async (data: CheckoutValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Processando...",
        description: "Redirecionando para o pagamento seguro.",
      });
    }, 1500);
  };

  const isOfferAdded = form.watch('addOffer');
  const mainPrice = 29.90;
  const offerPrice = 10.00;
  const totalPrice = isOfferAdded ? mainPrice + offerPrice : mainPrice;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] font-sans pb-10">
      <main className="container mx-auto max-w-[550px] pt-0 space-y-4">
        
        {/* Banner Superior Profissional */}
        <div className="w-full overflow-hidden shadow-sm">
          <img 
            src="https://picsum.photos/seed/unban-banner/800/400" 
            alt="Receba Acesso Imediatamente" 
            className="w-full h-auto object-cover"
            data-ai-hint="gaming banner"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 md:px-0">
            
            {/* Card 1: Resumo */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-lg font-bold">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="flex gap-4 items-center py-2">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 shadow-lg border-2 border-magenta/20">
                    <Terminal className="text-[#FF0080] h-8 w-8" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-bold text-sm">Unban Strategy</p>
                    <p className="text-[11px] text-zinc-500 leading-tight line-clamp-2">
                      O Método de Desbanimento para Free Fire ensina como estruturar corretamente um pedido de revisão dentro do suporte...
                    </p>
                  </div>
                </div>

                <div className="h-px bg-zinc-100 w-full" />

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-sm font-medium text-zinc-600">
                    <span>Subtotal</span>
                    <span>R$ {mainPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {isOfferAdded && (
                    <div className="flex justify-between items-center text-sm font-medium text-zinc-600">
                      <span>Bypass Criptografado</span>
                      <span>R$ {offerPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-xl font-black text-[#FF0080]">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Identificação */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-lg font-bold">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold text-zinc-600">Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} className="h-12 bg-[#F9FAFB] border-zinc-200 rounded-xl focus:ring-[#FF0080] focus:border-[#FF0080]" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold text-zinc-600">E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} className="h-12 bg-[#F9FAFB] border-zinc-200 rounded-xl focus:ring-[#FF0080] focus:border-[#FF0080]" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-red-500" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Bump (Segurança) */}
            <Card className="border-2 border-dashed border-[#FF0080]/20 shadow-sm rounded-3xl bg-[#FFF5F9] overflow-hidden relative">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-pink-100">
                    <Lock className="text-[#FF0080] h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#FF0080] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Recomendado</span>
                    </div>
                    <p className="text-[13px] font-bold leading-tight">
                      Deseja adicionar o <span className="text-[#FF0080]">Bypass Anti-Detecção v4.0</span> por apenas R$ 10,00?
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">Evita que a Garena identifique seu IP durante a recuperação.</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="addOffer"
                  render={({ field }) => (
                    <div 
                      onClick={() => field.onChange(!field.value)}
                      className={`
                        cursor-pointer w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all font-bold text-xs uppercase
                        ${field.value ? 'bg-[#FF0080] text-white shadow-md' : 'bg-white border-2 border-zinc-100 text-zinc-900'}
                      `}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${field.value ? 'bg-white text-[#FF0080] border-transparent' : 'bg-transparent border-zinc-200'}`}>
                        {field.value && <Check className="h-3 w-3 stroke-[4]" />}
                      </div>
                      {field.value ? 'Acesso Seguro Adicionado!' : 'Sim, quero proteger minha conta'}
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card 3: Pagamento */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-lg font-bold">Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-6">
                <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-2xl border border-zinc-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <CreditCard className="text-[#FF0080] h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Liberação imediata via PIX</p>
                    <p className="text-[10px] text-zinc-500">Acesso enviado instantaneamente por e-mail.</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-black uppercase italic tracking-tighter bg-[#FF0080] text-white hover:bg-[#E60073] transition-all rounded-2xl shadow-lg shadow-[#FF0080]/20"
                >
                  {isLoading ? 'PROCESSANDO...' : 'FINALIZAR COMPRA AGORA'}
                </Button>
                
                <div className="flex flex-col items-center gap-3 opacity-60">
                  <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Seguro</span>
                      <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </form>
        </Form>

        {/* Rodapé Seguro */}
        <div className="px-6 pt-2 pb-10 flex flex-col items-center gap-4">
          <p className="text-[10px] text-center text-zinc-400 font-medium">
            Ambiente de pagamento 100% criptografado e seguro.<br/>
            Seu acesso será liberado assim que o pagamento for confirmado.
          </p>
        </div>
      </main>
    </div>
  );
}

