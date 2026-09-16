'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/header';
import { ArrowRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/i18n';

const quizSchema = z.object({
  suspensionTime: z.string().min(1),
  thirdPartySoftware: z.string().min(1),
  banReason: z.string().min(1),
  firstOffense: z.string().min(1),
  hasMadePurchases: z.string().min(1),
  priorWarnings: z.string().min(1),
  banDescription: z.string().min(10),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function AnalysisPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
  });

  function onSubmit(data: QuizFormValues) {
    const query = new URLSearchParams(data).toString();
    router.push(`/chat?${query}`);
  }

  function onError() {
    toast({
        variant: "destructive",
        title: t.analysis_error_title,
        description: t.analysis_error_desc,
    });
  }

  return (
    <div className="flex min-h-full flex-col bg-[#050505] text-white selection:bg-[#ff00b8]/30 overflow-x-hidden relative">
      {/* Camadas de Fundo Cyberpunk */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ff00b8]/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(#ff00b8 1px, transparent 1px), linear-gradient(90deg, #ff00b8 1px, transparent 1px)', backgroundSize: '50px 50px' }} 
        />
      </div>

      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20 relative z-10">
        <section className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="font-black italic text-4xl md:text-6xl tracking-tighter uppercase leading-[0.9] drop-shadow-[0_0_15px_rgba(255,0,184,0.4)]">
              Questionário de <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ff00b8]">Análise</span>
            </h1>
            <p className="mt-4 text-zinc-500 font-medium text-sm md:text-base tracking-tight max-w-[400px] mx-auto uppercase">
                {t.analysis_desc}
            </p>
        </section>

        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in-50 duration-1000">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-10">
                    {t.analysis_questions.map((question, index) => (
                    <FormField
                        key={question.id}
                        control={form.control}
                        name={question.id as keyof QuizFormValues}
                        render={({ field }) => (
                            <Card className="w-full border-[#ff00b8]/20 bg-[#0f0f0f]/80 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_-15px_rgba(255,0,184,0.2)] border-t-[#ff00b8]/40 overflow-hidden relative group">
                                <CardHeader className="p-8 pb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="relative shrink-0 mt-1">
                                            <div className="absolute inset-0 bg-[#ff00b8] blur-md opacity-50 rounded-lg" />
                                            <div className="relative bg-[#ff00b8] text-white font-black italic h-10 w-10 flex items-center justify-center rounded-lg rotate-12 group-hover:rotate-0 transition-transform">
                                                <span className="-rotate-12 group-hover:rotate-0 transition-transform">{index + 1}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-black italic text-lg md:text-xl uppercase tracking-tight text-white/90 leading-tight">
                                            {question.label}
                                        </h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-3"
                                    >
                                    {question.options.map((option) => (
                                        <FormItem key={option} className="flex items-center space-x-4 space-y-0 bg-black/40 border border-zinc-800/80 p-4 rounded-2xl hover:border-[#ff00b8]/40 transition-all cursor-pointer group/item">
                                            <FormControl>
                                                <RadioGroupItem 
                                                    value={option} 
                                                    className="h-6 w-6 border-2 border-zinc-700 data-[state=checked]:border-[#ff00b8] data-[state=checked]:text-[#ff00b8] transition-colors"
                                                />
                                            </FormControl>
                                            <FormLabel className="font-bold text-sm md:text-base text-zinc-400 group-data-[state=checked]/item:text-white cursor-pointer transition-colors w-full">
                                                {option}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                    </RadioGroup>
                                </FormControl>
                                </CardContent>
                            </Card>
                        )}
                    />
                    ))}

                    <FormField
                        control={form.control}
                        name="banDescription"
                        render={({ field }) => (
                            <Card className="w-full border-[#ff00b8]/20 bg-[#0f0f0f]/80 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_-15px_rgba(255,0,184,0.2)] border-t-[#ff00b8]/40 overflow-hidden relative group">
                                <CardHeader className="p-8 pb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="relative shrink-0 mt-1">
                                            <div className="absolute inset-0 bg-[#ff00b8] blur-md opacity-50 rounded-lg" />
                                            <div className="relative bg-[#ff00b8] text-white font-black italic h-10 w-10 flex items-center justify-center rounded-lg rotate-12 group-hover:rotate-0 transition-transform">
                                                <span className="-rotate-12 group-hover:rotate-0 transition-transform">{t.analysis_questions.length + 1}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-black italic text-lg md:text-xl uppercase tracking-tight text-white/90 leading-tight">
                                            {t.analysis_q_text_label}
                                        </h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                <FormControl>
                                    <div className="relative group">
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#ff00b8] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <Textarea
                                            placeholder={t.analysis_q_text_placeholder}
                                            className="min-h-[160px] bg-black/40 border-zinc-800 rounded-2xl focus-visible:ring-[#ff00b8] focus-visible:border-[#ff00b8] border-2 transition-all p-6 text-zinc-300 font-medium placeholder:text-zinc-700"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                </CardContent>
                            </Card>
                        )}
                    />

                    <div className="flex flex-col items-center pt-8 pb-20">
                        <Button 
                          type="submit" 
                          className="w-full max-w-sm h-16 bg-gradient-to-r from-[#ff00b8] to-[#d40099] hover:from-[#d40099] hover:to-[#ff00b8] text-white font-black italic text-xl uppercase tracking-tighter rounded-full shadow-[0_10px_30px_-5px_rgba(255,0,184,0.5)] transition-all hover:scale-[1.03] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                            <span className="relative z-10 flex items-center gap-3">
                                {t.analysis_send}
                                <ArrowRight className="h-6 w-6 stroke-[3]" />
                            </span>
                        </Button>
                        <div className="mt-8 flex items-center gap-3 opacity-30">
                            <Zap className="h-4 w-4 text-[#ff00b8] fill-[#ff00b8]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Dados Criptografados</span>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent opacity-50 shadow-[0_0_20px_rgba(255,0,184,0.8)]" />
    </div>
  );
}
