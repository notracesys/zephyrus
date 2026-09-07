'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, Lock, CreditCard, User, Mail, Star, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useAppConfig } from '@/components/config-provider';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  addOffer: z.boolean().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const config = useAppConfig();
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
      // window.location.href = lang === 'pt' ? config.checkoutUrlPt : config.checkoutUrlEnEs;
    }, 1500);
  };

  const isOfferAdded = form.watch('addOffer');
  const mainPrice = 29.90;
  const offerPrice = 10.00;
  const totalPrice = isOfferAdded ? mainPrice + offerPrice : mainPrice;

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7F9] text-[#2D3748]">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-[500px] space-y-4">
        
        {/* Banner de Topo */}
        <div className="w-full rounded-[2rem] overflow-hidden shadow-lg">
          <img 
            src="https://picsum.photos/seed/unban/800/400" 
            alt="Receba acesso imediato" 
            className="w-full h-auto object-cover"
            data-ai-hint="gaming banner"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Step 1: Identificação */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
              <div className="bg-white p-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF0080] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-lg font-bold">Identificação</h2>
                </div>
              </div>
              <CardContent className="p-6 pt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome e Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome e Sobrenome" {...field} className="h-12 bg-white border-zinc-200 rounded-2xl focus:ring-[#FF0080]" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seuemail@exemplo.com" {...field} className="h-12 bg-white border-zinc-200 rounded-2xl focus:ring-[#FF0080]" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Bump: Aumente suas chances */}
            <Card className="border-2 border-dashed border-[#00C896]/30 shadow-sm rounded-[2rem] overflow-hidden bg-white relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#00C896] text-white text-[10px] font-black px-4 py-1 rounded-b-xl uppercase tracking-widest z-10">
                Aumente suas chances
              </div>
              <CardContent className="p-6 pt-8 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                    <img src="https://picsum.photos/seed/support/200/200" alt="Suporte" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#E53E3E] text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase">Últimas Unidades</span>
                    </div>
                    <p className="text-[11px] font-medium leading-tight mt-1 text-zinc-600">
                      90% das pessoas que tiveram o suporte conseguiram suas contas de volta.
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-400 line-through">R$ 13,00</span>
                      <span className="text-sm font-black text-[#1A202C]">R$ 10,00</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="addOffer"
                    render={({ field }) => (
                      <div 
                        onClick={() => field.onChange(!field.value)}
                        className={`
                          cursor-pointer w-full h-12 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-sm
                          ${field.value ? 'bg-[#FF0080] text-white' : 'bg-[#FF0080] text-white'}
                        `}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 border-white flex items-center justify-center ${field.value ? 'bg-white text-[#FF0080]' : 'bg-transparent'}`}>
                          {field.value && <Check className="h-4 w-4 stroke-[4]" />}
                        </div>
                        + Adicionar oferta
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Pagamento */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
              <div className="bg-white p-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF0080] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-lg font-bold">Pagamento</h2>
                </div>
              </div>
              <CardContent className="p-6 pt-4 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                       <img src="https://picsum.photos/seed/logo/100/100" alt="Unban Strategy" className="opacity-80" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Unban Strategy</p>
                      <p className="text-[#FF0080] font-black text-sm">R$ 29,90</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-zinc-800">Total</span>
                  <span className="text-lg font-black text-[#FF0080]">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-16 text-xl font-black uppercase tracking-tight bg-[#FF0080] text-white hover:bg-[#E60073] rounded-2xl shadow-lg shadow-[#FF0080]/20"
                  >
                    {isLoading ? 'PROCESSANDO...' : 'PAGAR AGORA'}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" /> Pagamento seguro via PIX
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento */}
            <div className="px-2">
              <Card className="border-none shadow-sm rounded-[2rem] bg-white p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-zinc-100">
                    <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                    <AvatarFallback>RD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">Rdzin</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />)}
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">tmj ravena, tu é foda, salvou hein kk</p>
                  </div>
                </div>
              </Card>
            </div>

          </form>
        </Form>

        {/* Rodapé de Segurança */}
        <div className="flex justify-center items-center gap-6 pt-4 pb-10 opacity-40">
           <Lock className="h-4 w-4" />
           <CreditCard className="h-4 w-4" />
           <ShieldCheck className="h-4 w-4" />
        </div>
      </main>
    </div>
  );
}
