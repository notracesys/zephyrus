'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Lock, Star, Terminal, Zap, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  addOffer: z.boolean().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const testimonials = [
  {
    name: "Kovazzi",
    avatar: "https://picsum.photos/seed/k1/100/100",
    text: "Pensei que era mentira antes de comprar kkkk. graças a Deus deu tudo certo 🙌",
    stars: 5
  },
  {
    name: "Kortex",
    avatar: "https://picsum.photos/seed/k2/100/100",
    text: "Unico que funcionou, comprei outros mas nenhum tinha dado certo",
    stars: 5
  },
  {
    name: "Davi7x",
    avatar: "https://picsum.photos/seed/k3/100/100",
    text: "Podem confiar na ravena aí rapaziada. Comprei e deu tudo certo",
    stars: 5
  }
];

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
    <main className="flex min-h-screen flex-col items-center bg-[#F8F9FA] pb-10">
      {/* Banner Superior */}
      <div className="mt-5 px-4 w-full max-w-[70rem]">
        <img 
          src="https://picsum.photos/seed/banner-ff/1200/360" 
          alt="Banner Principal" 
          className="w-full h-auto rounded-xl object-cover shadow-sm"
          data-ai-hint="gaming banner"
        />
      </div>

      <div className="mt-6 flex w-full max-w-[70rem] flex-col-reverse lg:flex-row gap-6 px-4">
        
        {/* Coluna Esquerda: Formulários */}
        <div className="lg:w-7/12 flex flex-col gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Identificação */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Identificação</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} className="h-12 rounded-lg bg-white border-zinc-200 focus:border-orange-400 focus:ring-0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Digite seu melhor e-mail" {...field} className="h-12 rounded-lg bg-white border-zinc-200 focus:border-orange-400 focus:ring-0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pagamento */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Pagamento</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-24 flex-col items-center justify-center rounded-md border-2 border-orange-400 bg-orange-50 text-orange-600 p-2">
                    <Zap className="h-5 w-5 fill-current" />
                    <span className="text-[10px] font-bold uppercase mt-1">PIX</span>
                  </div>
                </div>
                <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Pague via PIX — confirmação automática e liberação na hora.</p>
                </div>
              </div>

              {/* Order Bump */}
              <div className="relative rounded-xl border-2 border-dashed border-orange-400 bg-orange-50/30 overflow-hidden transition-all hover:shadow-md">
                <div className="bg-orange-400 p-2.5">
                  <p className="text-center text-xs font-bold text-white uppercase tracking-wider">
                    Adquira 100% da minha ajuda no processo!
                  </p>
                </div>
                <div className="p-4 flex gap-4 items-start">
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-zinc-200 overflow-hidden">
                    <img src="https://picsum.photos/seed/support/200/200" alt="Suporte" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-900">Suporte 100% VIP</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      90% das pessoas que tiveram o suporte VIP conseguiram suas contas de volta mais rápido.
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      Por apenas <span className="text-orange-600">R$ 10,00</span>
                    </p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="addOffer"
                  render={({ field }) => (
                    <div 
                      onClick={() => field.onChange(!field.value)}
                      className="absolute bottom-4 right-4 flex cursor-pointer select-none items-center gap-2 rounded-md bg-orange-400 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-orange-500 transition-colors"
                    >
                      <Checkbox 
                        id="bump" 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-orange-400"
                      />
                      <span>Pegar oferta</span>
                    </div>
                  )}
                />
              </div>

              {/* Botão Finalizar */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 text-lg font-bold uppercase tracking-widest bg-[#FF0080] hover:bg-[#E60073] text-white rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
              >
                {isLoading ? 'Processando...' : 'Finalizar Pagamento'}
              </Button>
            </form>
          </Form>

          {/* Banner Inferior (Mobile Only ou extra) */}
          <div className="lg:hidden mt-4">
             <img src="https://picsum.photos/seed/safe/800/200" alt="Seguro" className="w-full rounded-xl" />
          </div>
        </div>

        {/* Coluna Direita: Resumo e Depoimentos */}
        <div className="lg:w-4/12 flex flex-col gap-6">
          <div className="sticky top-6 flex flex-col gap-6">
            
            {/* Resumo */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-zinc-100">
              <h2 className="font-bold text-zinc-900 mb-4">Resumo</h2>
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-zinc-100 overflow-hidden">
                   <img src="https://picsum.photos/seed/product/200/200" alt="Produto" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-zinc-900">Unban Strategy v4.0</span>
                  <p className="text-[11px] text-zinc-500 leading-tight line-clamp-2">
                    O Método de Desbanimento ensina como estruturar corretamente um pedido de revisão dentro do suporte.
                  </p>
                </div>
              </div>

              <Separator className="my-4 bg-zinc-100" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span>R$ {mainPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                {isOfferAdded && (
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Suporte VIP</span>
                    <span>R$ {offerPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <Separator className="my-2 bg-zinc-100" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900">Total</span>
                  <span className="text-xl font-black text-zinc-900">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Ambiente Seguro
                </div>
              </div>
            </div>

            {/* Depoimentos */}
            <div className="flex flex-col gap-4">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-xl bg-white p-4 shadow-sm border border-zinc-100 flex flex-col gap-2 animate-in fade-in duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-100">
                        <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-zinc-900">{t.name}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(t.stars)].map((_, s) => (
                        <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 italic">"{t.text}"</p>
                </div>
              ))}
            </div>

            {/* Banner Final */}
            <div className="mt-2">
               <img src="https://picsum.photos/seed/footer-safe/600/200" alt="Compra Garantida" className="w-full rounded-xl opacity-80" />
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
