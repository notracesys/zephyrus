'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Star, ArrowRight, Lock } from 'lucide-react';
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

const PixIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.012 2.502c-.255 0-.495.105-.67.28l-8.56 8.56c-.37.37-.37.97 0 1.34l8.56 8.56c.175.175.415.28.67.28s.495-.105.67-.28l8.56-8.56c.37-.37.37-.97 0-1.34l-8.56-8.56c-.175-.175-.415-.28-.67-.28zm0 2.27l7.29 7.23-7.29 7.29-7.29-7.29 7.29-7.23zm0 2.8c-.14 0-.27.05-.37.15l-4.43 4.43c-.2.2-.2.53 0 .73l4.43 4.43c.1.1.23.15.37.15s.27-.05.37-.15l4.43-4.43c.2-.2.2-.53 0-.73l-4.43-4.43c-.1-.1-.23-.15-.37-.15z" />
  </svg>
);

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
          className="w-full h-auto rounded-xl object-cover shadow-sm border border-zinc-200"
          data-ai-hint="gaming banner"
        />
      </div>

      <div className="mt-6 flex w-full max-w-[70rem] flex-col lg:flex-row gap-6 px-4">
        
        {/* Coluna Esquerda: Conteúdo Principal */}
        <div className="lg:w-7/12 flex flex-col gap-6">
          
          {/* 1. Resumo */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100">
            <h2 className="mb-4 text-lg font-bold text-zinc-900 flex items-center gap-2">
               Resumo do Pedido
            </h2>
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                 <img src="https://picsum.photos/seed/product/200/200" alt="Produto" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-base font-bold text-zinc-900 leading-tight">Unban Strategy v4.0</span>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                  Método avançado de estruturação de pedidos de revisão para recuperação de contas suspensas.
                </p>
              </div>
            </div>

            <Separator className="my-5 bg-zinc-100" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>R$ {mainPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              {isOfferAdded && (
                <div className="flex justify-between text-sm text-zinc-500">
                  <span className="flex items-center gap-1">Suporte VIP <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">OFERTA</span></span>
                  <span>R$ {offerPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-zinc-900">Total</span>
                <span className="text-2xl font-black text-zinc-900 tracking-tighter">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 2. Identificação */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Identificação</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-zinc-700">Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} className="h-12 rounded-lg bg-white border-zinc-200 focus:border-zinc-400 focus:ring-0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-zinc-700">E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Digite seu melhor e-mail" {...field} className="h-12 rounded-lg bg-white border-zinc-200 focus:border-zinc-400 focus:ring-0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 3. Pagamento */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Pagamento</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-16 w-32 flex-col items-center justify-center rounded-lg border-2 border-emerald-500 bg-emerald-50/50 text-emerald-600 p-2 shadow-sm">
                    <PixIcon className="h-8 w-8 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-wider">PIX</span>
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500 font-medium">Pague via PIX — confirmação automática e liberação imediata.</p>
                </div>
              </div>

              {/* 4. Order Bump */}
              <div className="relative rounded-xl border-2 border-dashed border-orange-400 bg-orange-50/20 overflow-hidden transition-all hover:bg-orange-50/40">
                <div className="bg-orange-400 p-2.5">
                  <p className="text-center text-[10px] font-black text-white uppercase tracking-[0.1em]">
                    ADICIONAR AJUDA ESPECIALIZADA
                  </p>
                </div>
                <div className="p-5 flex gap-4 items-start">
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-zinc-200 overflow-hidden border border-orange-100">
                    <img src="https://picsum.photos/seed/support/200/200" alt="Suporte" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 pr-24">
                    <h3 className="text-sm font-bold text-zinc-900">Suporte 100% VIP</h3>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                      90% das pessoas que tiveram o suporte VIP conseguiram suas contas de volta mais rápido.
                    </p>
                    <p className="mt-2 text-sm font-bold">
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
                      className="absolute bottom-4 right-4 flex cursor-pointer select-none items-center gap-2 rounded-lg bg-orange-400 px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-orange-500 transition-colors shadow-md"
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

              {/* 5. Botão Finalizar */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 text-lg font-black uppercase tracking-widest bg-[#FF0080] hover:bg-[#E60073] text-white rounded-xl shadow-[0_8px_30px_rgb(255,0,128,0.3)] transition-all active:scale-[0.98] mb-8"
              >
                {isLoading ? 'Sincronizando...' : 'Finalizar Pagamento'}
              </Button>
            </form>
          </Form>

        </div>

        {/* Coluna Direita: Prova Social e Segurança */}
        <div className="lg:w-4/12 flex flex-col gap-6">
          <div className="sticky top-6 flex flex-col gap-6">
            
            {/* Ambiente Seguro (Desktop) */}
            <div className="hidden lg:flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shadow-sm">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Ambiente Seguro
              </div>
            </div>

            {/* Depoimentos */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Feedback de Membros</h3>
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-xl bg-white p-4 shadow-sm border border-zinc-100 flex flex-col gap-2 transition-transform hover:scale-[1.01]">
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
                  <p className="text-xs text-zinc-600 italic leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>

            {/* Banner Final Segurança */}
            <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 shadow-sm opacity-90">
               <img src="https://picsum.photos/seed/footer-safe/600/200" alt="Compra Garantida" className="w-full h-auto" />
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
