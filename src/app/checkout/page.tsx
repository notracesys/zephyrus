'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, Lock, CreditCard, Star, Check, Terminal } from 'lucide-react';
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
      // A lógica de redirecionamento virá depois
    }, 1500);
  };

  const isOfferAdded = form.watch('addOffer');
  const mainPrice = 29.90;
  const offerPrice = 10.00;
  const totalPrice = isOfferAdded ? mainPrice + offerPrice : mainPrice;

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7F9] text-[#2D3748] selection:bg-[#FF0080] selection:text-white">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-[500px] space-y-4">
        
        {/* Banner de Topo */}
        <div className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
          <img 
            src="https://picsum.photos/seed/secure/800/400" 
            alt="Secure Checkout" 
            className="w-full h-auto object-cover"
            data-ai-hint="secure server"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Step 1: Identificação */}
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-8 pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF0080] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-[#FF0080]/20">1</div>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">Identificação</h2>
                </div>
              </div>
              <CardContent className="p-8 pt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nome e Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} className="h-14 bg-[#F8FAFC] border-zinc-100 rounded-2xl focus:ring-[#FF0080] focus:border-[#FF0080] font-medium" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">E-mail para Recebimento</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seuemail@exemplo.com" {...field} className="h-14 bg-[#F8FAFC] border-zinc-100 rounded-2xl focus:ring-[#FF0080] focus:border-[#FF0080] font-medium" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Bump: Aumente suas chances */}
            <Card className="border-4 border-dashed border-[#00C896]/20 shadow-sm rounded-[2.5rem] overflow-hidden bg-white relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#00C896] text-white text-[9px] font-black px-5 py-1.5 rounded-b-2xl uppercase tracking-[0.2em] z-10 shadow-sm">
                Aumente suas chances
              </div>
              <CardContent className="p-8 pt-10 space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-950 flex items-center justify-center shrink-0 border-2 border-zinc-800 shadow-inner">
                    <Terminal className="text-[#00C896] h-10 w-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#E53E3E] text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Prioridade Máxima</span>
                    </div>
                    <p className="text-[12px] font-bold leading-tight mt-2 text-zinc-600">
                      90% dos usuários que ativaram o <span className="text-zinc-900 font-black">Bypass v4.0</span> recuperaram a conta em 24h.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-zinc-400 line-through">R$ 13,00</span>
                      <span className="text-lg font-black text-[#1A202C]">R$ 10,00</span>
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
                          cursor-pointer w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-sm uppercase tracking-tight
                          ${field.value ? 'bg-[#FF0080] text-white shadow-lg shadow-[#FF0080]/20' : 'bg-zinc-900 text-white hover:bg-zinc-800'}
                        `}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center transition-colors ${field.value ? 'bg-white text-[#FF0080]' : 'bg-transparent'}`}>
                          {field.value && <Check className="h-4 w-4 stroke-[4]" />}
                        </div>
                        {field.value ? 'Oferta Adicionada!' : '+ Sim, quero o Bypass'}
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Pagamento */}
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-8 pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF0080] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-[#FF0080]/20">2</div>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">Pagamento</h2>
                </div>
              </div>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-zinc-800 shadow-xl">
                       <Terminal className="text-white/40 h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">Unban Strategy</p>
                      <p className="text-[#FF0080] font-black text-lg italic">R$ 29,90</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">Valor Total</span>
                  <span className="text-2xl font-black text-[#FF0080] italic">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-16 text-xl font-black uppercase italic tracking-tighter bg-[#FF0080] text-white hover:bg-[#E60073] hover:scale-[1.02] active:scale-[0.98] transition-all rounded-[1.5rem] shadow-xl shadow-[#FF0080]/30"
                  >
                    {isLoading ? 'PROCESSANDO...' : 'FINALIZAR PAGAMENTO'}
                  </Button>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-4 text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Seguro</span>
                        <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full" />
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento Realista */}
            <div className="px-2">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 border-l-8 border-l-[#FF0080]">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-zinc-100 shadow-sm">
                    <AvatarImage src="https://picsum.photos/seed/gamer/100/100" />
                    <AvatarFallback className="bg-zinc-100 font-bold">RD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm uppercase tracking-tight">Vini do FF</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-[#FF0080] text-[#FF0080]" />)}
                      </div>
                    </div>
                    <p className="text-[12px] text-zinc-500 font-bold italic leading-tight">"Recuperei minha conta level 70 em menos de 10 horas. O bypass salvou demais, achei q ia dar ruim mas deu bom. Valeu!"</p>
                  </div>
                </div>
              </Card>
            </div>

          </form>
        </Form>

        {/* Rodapé de Segurança */}
        <div className="flex justify-center items-center gap-8 pt-6 pb-12 opacity-20 grayscale">
           <Lock className="h-5 w-5" />
           <CreditCard className="h-5 w-5" />
           <ShieldCheck className="h-5 w-5" />
        </div>
      </main>
    </div>
  );
}
